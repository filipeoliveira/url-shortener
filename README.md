### Bemobi hire.me
Este projeto consiste em uma API de encurtador de URLs.

####Tecnologias usadas:
- Node 8 com a framework AdonisJS
- Redis
- Docker

###Execução
##### Terminal
1. Clone do repositório.
2.  Instalação das dependências através do "npm install"
3.  Execução do servidor através do "npm start"

##### Docker 
1. Clone do repositório, acessar a pasta do projeto e executar "docker-compose up".

### Endpoints
Descrição | Método  | URL | Parâmetros 
------------- | -------------
Encurta uma URL | PUT  | /shorten |  url, custom_alias(opcional)
Acessa uma URL encurtada, caso exista, através do alias| GET  | /retrieve/{alias} | alias 

#### Algoritmo de hash
A estratégia usada para geração do hash final foi:
1. Criptografar a url fornecida na requisição com o algoritmo MD5.
2. Capturar a codificação da URL em base 64.
3. Realizar uma limpeza de determinados caracteres que podem complicar a URL ( /, +)
4.  Captura dos 7 primeiros caracteres do MD5 codificado em base64 e limpo.

#### Algoritmo de geração de alias
Se um alias for específicado na requisição, uma limpeza básica é feita para remover espaços e caracteres que não são URL safe.

Caso um alias não seja específicado, o algoritmo se inicia:
1. Apenas caracteres alfanumericos são permitidos na criação do alias, ou seja 62 caracteres. ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
2. É gerado um número pseudoaleatório entre 0 e 1 que é multiplicado ao ser multiplicado pelo range de caracteres permitidos resultará no índice do caracter escolhido para compor o alias.
Por exemplo:

Número aleatório | Multiplicação  | Índice | Caracter 
------------- | -------------
0.17 |  0.17 * 62 = 10.54 | 10  |  strings[10] = "k"

Tal algoritmo é repetido 7 vezes. Resultando em possíveis (62^7) alias únicos.


