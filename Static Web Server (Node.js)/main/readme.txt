1) The hardest thing was to figure the flow of what we need to do
2) Everything
3) In order to make our server efficient we parse the request "on-time" ,that is
   we didn't wait for all the chunks of the request to be received, and if we got a chunk
   we immediately knew which part of the request it contains and parse it respectively.
4) we gave out server 3 basic tests that includes the ex2 files.
   we build 3 requests, send them and get the responses with the http module using the get function.
   we then took each response and compared the data of the response to the data from the filestream,
   to verify if it's indeed the file we wanted from the server.