//Exemplo 1 =================================================================================

import http from "http";
import { readFileSync, createReadStream } from "fs";

http.createServer((req, res) => {

    // const file = readFileSync("big.file")//.toString();
    // res.write(file);
    // res.end()

    createReadStream("big.file")
        .pipe(res)

}).listen(3000, () => console.log("Rodando"));

//Exemplo 2 ====================================================================================

import net from "net";
net.createServer(socket => socket.pipe(process.stdout)).listen(1338);

//Exemplo 3 ====================================================================================

