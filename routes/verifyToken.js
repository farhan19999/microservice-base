const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        res.status(403).json("invalid token");
      }
      //authenticated user
      else {
        req.user = user;
        next();
      }
    });
  } else {
    res.status(401).json("unauthenticated");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.email === req.params.email) {
      next();
    } else {
      console.log("user email", req.user.email);
      console.log("param email", req.params.email);
      res.status(403).json("you are not allowed to do that");
    }
  });
};
//for seller works
const verifyTokenAndSeller = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.type === "seller") {
      next();
    } else {
      res.status(403).json("you are not allowed to do that");
    }
  });
};
//for customer works
const verifyTokenAndCustomer = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.type === "customer") {
      next();
    } else {
      res.status(403).json("you are not allowed to do that");
    }
  });
};
//for admin works
const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.type === "admin") {
      next();
    } else {
      res.status(403).json("you are not allowed to do that");
    }
  });
};
const verifyTokenAndAdminOrSeller = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.type === "admin" || req.user.type === "seller") {
      next();
    } else {
      res.status(403).json("you are not allowed to do that");
    }
  });
};
const verifyTokenAndAdminOrCustomer = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.type === "admin" || req.user.type === "customer") {
      next();
    } else {
      res.status(403).json("you are not allowed to do that");
    }
  });
};
const verifyTokenAndDelivery = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.type === "delivery") {
      next();
    } else {
      res.status(403).json("you are not allowed to do that");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndSeller,
  verifyTokenAndCustomer,
  verifyTokenAndAdmin,
  verifyTokenAndAdminOrSeller,
  verifyTokenAndAdminOrCustomer,
  verifyTokenAndDelivery,
};
