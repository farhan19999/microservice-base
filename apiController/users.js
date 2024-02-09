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
  
}

exports.UserController = UserController;
