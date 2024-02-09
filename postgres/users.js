const Workspace = require("./baseConnection").Workspace;

class UserWorkspace extends Workspace {
  constructor() {
    super();
  }

  getAllUsers = async function () {
    const query = `SELECT * FROM users`;
    const params = [];
    const result = await this.query(query, params);
    return result;
  };
  //now write the addUser method that will take a user object for the users.js api controller
  addUser = async function (user) {
    const query = `INSERT INTO "user" (user_id, user_name, balance) VALUES ($1, $2, $3)`;
    const params = [user.user_id, user.user_name, user.balance];
    const result = await this.query(query, params);
    return result;
  };
  //write the getWallet method for the users.js api controller
  getWallet = async function (user_id) {
    const query = `SELECT user_name,balance FROM "user" WHERE user_id = $1`;
    const params = [user_id];
    const result = await this.query(query, params);
    if (result.success) {
      //check if the results is empty
      if (result.data.length === 0) {
        return {
          success: true,
          fetched: false,
          data: {
            message: `wallet with id: ${user_id} was not found`,
          },
        };
      } else {
        return {
          success: true,
          fetched: true,
          data: {
            wallet_id: parseInt(user_id),
            balance: result.data[0].balance,
            wallet_user: {
              user_id: parseInt(user_id),
              user_name: result.data[0].user_name,
            },
          },
        };
      }
    }
    return result;
  };
  //write the addWalletBalance method for the users.js api controller like the above getWallet method
  addWalletBalance = async function (user_id, amount) {
    //check if the wallet balance is out of range from 100 and 10000 and also it must be an integer
    if (amount < 100 || amount > 10000 || !Number.isInteger(amount)) {
      return {
        success: true,
        fetched: false,
        outOfRange: true,
        data: {
          message: `invalid amount: ${amount}`,
        },
      };
    }
    const query = `UPDATE "user" SET balance = balance + $1 WHERE user_id = $2`;
    const params = [amount, user_id];
    const result = await this.query(query, params);
    if (result.success) {
      //check if the results is empty
      if (result.rowCount === 0) {
        return {
          success: true,
          fetched: false,
          outOfRange: false,
          data: {
            message: `wallet with id: ${user_id} was not found`,
          },
        };
      } else {
        //now call the getWallet method to get the response
        const new_updated_res = await this.getWallet(user_id);
        return {
          success: true,
          fetched: true,
          outOfRange: false,
          data: new_updated_res.data,
        };
      }
    }
    return result;
  };
}
exports.UserWorkspace = UserWorkspace;
