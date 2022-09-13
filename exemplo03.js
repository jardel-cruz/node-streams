import { dirname, join } from "path";
import { createReadStream, createWriteStream } from "fs";
import { readdir } from "fs/promises";
import { promisify } from "util";
import { pipeline, Transform } from "stream";

//Lig para debug.
import debug from "debug";
//Lig para converter csv para json. 
import csvtojson from "csvtojson";
//Lig para converter json para csv.
import jsonToCsv from "json-to-csv-stream";
//Lig para concatenar streams.
import StreamConcat from "stream-concat";

//Com isso conseguimos o CWD em que o arquivo esteja, independente de onde ele seja rodado.
const { pathname: currentFile } = new URL(import.meta.url);

//Convertendo o pipeline para Async com promisify.
const pipelineAsync = promisify(pipeline);
const log = debug("app:concat");

const cwd = dirname(currentFile);
//Diretório dos arquivos .csv.
const fileDir = `${cwd}/data`;
//Arquivo onde o csv final cerá salvo.
const output = `${cwd}/final.csv`;

//iniciando contagem do tempo do processo.
console.time("concatenando-arquivos");

//Usando o readdir() para buscar os arquivos da pasta data e filtrando somente os .csv.
const arquivos = (await readdir("data")).filter(arquivo => arquivo.endsWith(".csv"));

log(`Processando ${arquivos}`);

const tempoDeLog = 1000;
//Enquanto o processamento assíncrono acontece mostra um "#" no console.
//E usa o unref() para sinalizar o momento de parar.
setInterval(() => process.stdout.write("#"), tempoDeLog).unref();

//Criando um array de streams com o método de array map().
//Para cada arquivo é chamado o createReadStream().
const streams = arquivos.map(arquivo => createReadStream(join(fileDir, arquivo)));
//Combinando os streams com o construtor de StreamConcat().
const combinarStreams = new StreamConcat(streams)
//Manipulando dados da stream.
const transformStream = new Transform({
    transform (chunk, encoding, cb) {
        //Transformando o chunk em um objeto.
        const data = JSON.parse(chunk);
        //Criando objeto com os campos id e country.
        const output = {
            id: data.Respondent,
            country: data.Country
        };
        //Retornando a callback com null no parâmetro de erro
        //E transformando o output em string antes de ser mandado de volta para o fluxo. 
        return cb(null, JSON.stringify(output));
    }
})

//Gravando dados no arquivo final do projeto.
const saidaDoFluxo = createWriteStream(output);

await pipelineAsync(
    //Recebendo dados
    combinarStreams,
    //Transformando o csv em json.
    csvtojson(),
    //Tratando o json.
    transformStream,
    //Transformando o json em csv.
    jsonToCsv(),
    //Salvando o dado no arquivo final.
    saidaDoFluxo
);

console.log(`\n${arquivos.length} arquivos processados e gravados em ${output}`);

log("Fim do processo")
//Finalizando a contagem do tempo de execução.
console.timeEnd("concatenando-arquivos");