const { Server } = require('socket.io')

const io = new Server(3001,{
    cors: true
})

const emailToSocketIdMap = new Map()
const socketToEmailIdMap = new Map()

// Like an event listener
io.on("connection", (socket)=>{
    console.log(`Socket connected : ${socket.id}: `);
    socket.on("room:join", (data)=>{
        const {email, roomId} = data
        emailToSocketIdMap.set(email, socket.id);
        socketToEmailIdMap.set(socket.id, email);

        io.to(roomId).emit("user:joined", { email, id: socket.id})
        socket.join(roomId)

        io.to(socket.id).emit("room:join", data)
    })

    socket.on("user:call", (data)=>{
        const {to, offer} = data
        console.log(to,offer)
        io.to(to).emit('incoming:call', {from : socket.id, offer})
    })

    socket.on("call:accepted", ({to,answer})=>{
        console.log("Called accpeted")
        io.to(to).emit("call:accepted", {from: socket.id, answer})
    })

    socket.on("peer:nego:needed", ({to, offer})=>{
        io.to(to).emit("peer:nego:needed", {from: socket.id, offer})
    })

    socket.on("peer:nego:final", ({to, answer})=>{
        io.to(to).emit("peer:nego:final", {from: socket.id, answer})
    })
});