const router = require("express-promise-router")();

const TicketController = require("../apiController/tickets").TicketController;
let ticketController = new TicketController();

// add new endpoints here
router.post("/", ticketController.purchaseTicket);

module.exports = router;
