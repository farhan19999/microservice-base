const UserWorkspace = require("../postgres/users").UserWorkspace;
const userWorkspace = new UserWorkspace();

class UserController {
  constructor() {}

  allusers = async (req, res, next) => {
    const result = await userWorkspace.getAllUsers();
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("users fetched");
      return res.status(200).json(result.data);
    }
  };
  // now add a addUser method that will take a request body as follow:
  //   {
  //  "user_id": integer, # user's numeric id
  //  "user_name": string, # user's full name
  //  "balance": integer # user's wallet balance
  // }
  //after response. it will return status 201 and the user object in the response body
  addUser = async (req, res, next) => {
    const user = req.body;
    const result = await userWorkspace.addUser(user);
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("user added");
      return res.status(201).json(user);
    }
  };
  //write to code to get the wallet
  getWallet = async (req, res, next) => {
    const user_id = req.params.wallet_id;
    const result = await userWorkspace.getWallet(user_id);
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      console.log("wallet fetched");
      if (!result.fetched) return res.status(404).json(result.data);
      return res.status(200).json(result.data);
    }
  };
  //write the code to add the wallet balance
  addWalletBalance = async (req, res, next) => {
    const user_id = req.params.wallet_id;
    const amount = req.body.recharge;
    const result = await userWorkspace.addWalletBalance(user_id, amount);
    if (!result.success)
      return res
        .status(500)
        .json({ code: "E0001", description: "Internal Error" });
    else {
      if (result.outOfRange) {
        console.log("wallet amount to recharge is out of range");
        return res.status(400).json(result.data);
      } else if (!result.fetched) {
        console.log("wallet not found");
        return res.status(404).json(result.data);
      }
      console.log("wallet recharged");
      return res.status(200).json(result.data);
    }
  };
}

exports.UserController = UserController;
