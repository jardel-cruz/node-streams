import { pipeline, Readable, Transform, Writable } from "stream";
import { promisify } from "util";
import { createWriteStream } from "fs"
import { randomBytes } from "crypto";

const pipelineAsync = promisify(pipeline);

{
    //Cria a entrada de dados para o pipe line.
    const readableStream = Readable({
        //Adiciona dados na readableStream com o método ".push()".
        read: function () {
            this.push("oie caralho1 ")
            this.push("oie caralho2 ")
            this.push("oie caralho3 ")
            //Avisa que acabou os dados.
            this.push(null)
        }
    })

    const writableStream = Writable({
        write: function (chunk, encoding, cb) {
            console.log("msg:", chunk.toString())
            cb()
        }
    })

    //Cria um fluxo de entrada, tratamento e saída de dados.
    await pipelineAsync(
        readableStream,
        writableStream
        // process.stdout
    )

    console.log("O processo 01 acabou!!!");
}
{
    //Cria a entrada de dados para o pipe line.
    const readableStream = Readable({
        read () {
            //Gera e adiciona objetos ao readable com um lup.
            for (let i = 0; i < 10e5; i++) {
                //Cria um objeto dinamicamente.
                const pessoa = { id: Date.now(), nome: randomBytes(25).toString("hex")};
                //Transforma o objeto em string para poder ser transformado em buffer.
                const pessoaString = JSON.stringify(pessoa);
                //Transforma a string em buffer e cria um chunk no fluxo.
                this.push(pessoaString);
            };
            this.push(null);
        }
    })

    //Trata os chunks que chegam do readable e passa para frente.
    const transformStream = Transform({
        transform (chunk, encoding, cb) {
            //Transforma os chunks que chegam novamente em objetos.
            const data = JSON.parse(chunk);
            //Cria uma string com o id e o nome do usuário.
            const resultado = `${data.id}: ${data.nome.toUpperCase()}\n`;
            //Chama a callback passando o erro e o dado final, transformando o dado em buffer.
            cb(null, resultado);
        }
    })

    // //recebe os dados transformados da um console.log() em cada chunk transformando eles em strings.
    // const writableStream = Writable({
    //     write (chunk, encoding, cb) {
    //         console.log("msg: ", chunk.toString()),
    //         cb()
    //     }
    // })

    await pipelineAsync(
        //Organiza a ordem de execução
        readableStream,
        transformStream,
        createWriteStream("dados.csv")
        // writableStream
        // process.stdout
    )

    console.log("O processo 02 acabou")
}