const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * Setu DigiLocker API headers
 */
const setuHeaders = () => ({
  'x-client-id': process.env.SETU_CLIENT_ID,
  'x-client-secret': process.env.SETU_CLIENT_SECRET,
  'x-product-instance-id': process.env.SETU_PRODUCT_INSTANCE_ID,
  'Content-Type': 'application/json',
});

/**
 * @route   POST /api/kyc/digilocker/init
 * @desc    Start a DigiLocker consent flow — returns consentUrl for redirect
 * @access  Private
 */
router.post('/digilocker/init', verifyToken, async (req, res, next) => {
  try {
    const { documentType, documentNumber, fullName } = req.body;

    const setuRes = await axios.post(
      `${process.env.SETU_BASE_URL}/api/digilocker/`,
      { redirectUrl: `${process.env.FRONTEND_URL}/dashboard` },
      { headers: setuHeaders() }
    );

    const { url, id } = setuRes.data;

    // Persist pending request on the user so we can fetch it on verify
    await User.findByIdAndUpdate(req.user._id, {
      kycPending: {
        requestId: id,
        documentType: documentType || '',
        documentNumber: documentNumber || '',
        fullName: fullName || '',
      },
    });

    return res.status(200).json({
      success: true,
      consentUrl: url,
      requestId: id,
    });
  } catch (err) {
    console.error('[KYC] DigiLocker init error:', err?.response?.data || err.message);
    const msg = err?.response?.data?.message || 'Failed to initiate DigiLocker verification.';
    return res.status(err?.response?.status || 500).json({ success: false, message: msg });
  }
});

/**
 * @route   POST /api/kyc/digilocker/verify
 * @desc    Poll DigiLocker status, fetch document, mark user as verified
 * @access  Private
 */
router.post('/digilocker/verify', verifyToken, async (req, res, next) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ success: false, message: 'requestId is required.' });
    }

    // 1. Check status
    const statusRes = await axios.get(
      `${process.env.SETU_BASE_URL}/api/digilocker/${requestId}/status`,
      { headers: setuHeaders() }
    );

    const status = statusRes.data?.status;
    if (status !== 'authenticated') {
      return res.status(400).json({
        success: false,
        message: `DigiLocker verification not complete. Status: ${status}`,
      });
    }

    // 2. Load kycPending to know which document to fetch
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const pending = user.kycPending || {};
    const docType = pending.documentType || '';

    let docData = {};

    try {
      if (docType === 'aadhaar') {
        // Fetch Aadhaar
        const aadhaarRes = await axios.get(
          `${process.env.SETU_BASE_URL}/api/digilocker/${requestId}/aadhaar`,
          { headers: setuHeaders() }
        );
        docData = aadhaarRes.data || {};
      } else if (docType === 'pan') {
        // Fetch PAN
        const panRes = await axios.post(
          `${process.env.SETU_BASE_URL}/api/digilocker/${requestId}/document`,
          { docType: 'PANCR', orgId: '001891' },
          { headers: setuHeaders() }
        );
        docData = panRes.data || {};
      } else if (docType === 'driving_license') {
        // Fetch DL
        const dlRes = await axios.post(
          `${process.env.SETU_BASE_URL}/api/digilocker/${requestId}/document`,
          { docType: 'DRVLC', orgId: '002262' },
          { headers: setuHeaders() }
        );
        docData = dlRes.data || {};
      }
    } catch (docErr) {
      console.warn('[KYC] Doc retrieval warning (falling back to user pending info):', docErr?.response?.data || docErr.message);
    }

    // 3. Mark user as verified, clear kycPending
    user.verificationStatus = 'verified';
    user.verificationDetails = {
      documentType: docType,
      documentNumber: pending.documentNumber || docData?.documentNumber || '',
      legalName: pending.fullName || docData?.name || '',
      submittedAt: new Date(),
      verifiedAt: new Date(),
    };
    user.kycPending = { requestId: '', documentType: '', documentNumber: '', fullName: '' };
    await user.save();

    // 4. Revoke token (best-effort, non-blocking)
    axios
      .get(`${process.env.SETU_BASE_URL}/api/digilocker/${requestId}/revoke`, {
        headers: setuHeaders(),
      })
      .catch((e) => console.warn('[KYC] Revoke warning:', e?.message));

    const updatedUser = await User.findById(user._id).select('-password');
    return res.status(200).json({
      success: true,
      message: 'Identity verified successfully via DigiLocker.',
      verificationStatus: user.verificationStatus,
      verificationDetails: user.verificationDetails,
      user: updatedUser,
    });
  } catch (err) {
    console.error('[KYC] DigiLocker verify error:', err?.response?.data || err.message);
    const msg = err?.response?.data?.message || 'Failed to verify DigiLocker identity.';
    return res.status(err?.response?.status || 500).json({ success: false, message: msg });
  }
});

module.exports = router;
