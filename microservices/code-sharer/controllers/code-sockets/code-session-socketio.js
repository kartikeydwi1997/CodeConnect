import * as codeSessionDao from "../code-sessions/code-session-dao.js";
import * as socketSessionDao from "../socket-sessions/socket-session-dao.js";

const viewCode = async (socket, data) => {
  console.log(
    "Connecting socket ID: " + socket.id + " to room ID: " + data.room_id
  );
  socket.join(data.room_id);
  let codeSession = await codeSessionDao.findCodeSession(data.room_id);
  console.log(codeSession);
  await socketSessionDao.createSocketSession({
    socket_id: socket.id,
    room_id: data.room_id,
  });

  if (codeSession) {
    codeSession.num_active_users += 1;
    const newData = {
      room_id: data.room_id,
      code: codeSession.code,
      num_active_users: codeSession.num_active_users,
    };
    await codeSessionDao.updateCodeSession(data.room_id, newData);
  } else {
    const newData = { ...data, num_active_users: 1 };
    codeSession = await codeSessionDao.createCodeSession(newData);
  }

  socket.emit("code", codeSession.code);
};

const removeUser = async (socket) => {
  console.log("Disconnecting socket ID: " + socket.id);

  const socketSession = await socketSessionDao.findSocketSession(socket.id);
  const room_id = socketSession.room_id;

  let codeSession = await codeSessionDao.findCodeSession(room_id);
  codeSession.num_active_users -= 1;

  await codeSessionDao.updateCodeSession(room_id, codeSession);
  await socketSessionDao.deleteSocketSession(socket.id);
  socket.leave(room_id);
};

const updateCode = async (socket, data) => {
  console.log("Updating code for room ID: " + data.room_id);

  let newData = await codeSessionDao.findCodeSession(data.room_id);
  newData.code = data.code;
  await codeSessionDao.updateCodeSession(data.room_id, newData);

  socket.to(newData.room_id).emit("recv_code", newData.code);
};

export default (socket) => {
  socket.on("view_code", (data) => viewCode(socket, data));
  socket.on("disconnect", () => removeUser(socket));
  socket.on("update_code", (data) => updateCode(socket, data));
};
