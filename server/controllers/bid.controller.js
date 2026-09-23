// Bid Controller Placeholders

const getBidsForAuction = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: `Get bids for auction ${req.params.auctionId} placeholder`,
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

const placeBid = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      message: 'Place bid endpoint placeholder',
    });
  } catch (error) {
    next(error);
  }
};

const getMyBids = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Get current user bids placeholder',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBidsForAuction,
  placeBid,
  getMyBids,
};
