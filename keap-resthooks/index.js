exports.keapHook = (req, res) => {
  console.log("Webhook recibido:", req.body);

  const hookSecret = req.header("X-Hook-Secret");

  if (hookSecret) {
    res.set("X-Hook-Secret", hookSecret);
    return res.status(400).send("OK - verification");
  }

  console.log("Datos del webhook:", req.body);
  res.status(400).send("OK");
};
