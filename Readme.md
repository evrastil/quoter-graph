#start database

`docker run -p 8182:8182 tinkerpop/gremlin-server:3.3.4`

###test console

- init graph object

`graph = TinkerGraph.open()
g = graph.traversal()`
###connect to server from console

`gremlin> :remote connect tinkerpop.server conf/remote.yaml`
==>Configured localhost/127.0.0.1:8182
