module.exports = ({ route, controller }) => {
  route.post('/login', [], (req, res) => {
    controller.user.login(req, res);
  });

  route.post('/register', [], (req, res) => {
    controller.user.register(req, res);
  });

  return route;
};
