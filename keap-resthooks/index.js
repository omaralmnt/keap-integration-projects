explorts.keapHook = (req, res) => {
  console.log("Webhook recibido:", req.body);

  const hookSecret = req.header("X-Hook-Secret");

  if (hookSecret) {
    res.set("X-Hook-Secret", hookSecret);
    return res.status(200).send("OK - verification");
  }

  console.log("Datos del webhook:", req.body);
  res.status(200).send("OK");
};
