const gremlin = require('gremlin')

const P = gremlin.process.P
const __ = gremlin.process.statics

const Graph = gremlin.structure.Graph
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const graph = new Graph();
const g = graph.traversal().withRemote(new DriverRemoteConnection('ws://localhost:8182/gremlin'))

const initGraph = async () => {
    await g.V().drop().iterate()

    await g.addV("carrier").property("name", "UPS").as("UPS").
    addV("carrier").property("name", "PostNL").as("PostNL").
    addV("carrier").property("name", "DHL").as("DHL").
    addV("zone").property("zip", "1234").as("Zone1234").
    addE("delivers").from_("UPS").to("Zone1234").property("days", "3").property("rate", "5 USD").
    addE("delivers").from_("DHL").to("Zone1234").property("days", "1").property("rate", "4 USD").
    addE("delivers").from_("PostNL").to("Zone1234").property("days", "4").property("rate", "2 USD").iterate()

}

const listCarrierServicesDeliveringIntoZone = async (zip) => {
    return await g.V().has("zone", "zip", zip).in_("delivers").values('name').toList()
}

const listZonesThatCarrierServiceDeliversTo = async (carrierName) => {
    return await g.V().has("carrier", "name", carrierName).out("delivers").values('zip').toList()
}

(async () => {
    try {
        await initGraph()
        console.log(await listCarrierServicesDeliveringIntoZone("1234"))
        console.log(await listZonesThatCarrierServiceDeliversTo("UPS"))
    } catch (e) {
        console.error(e)
    }
})()
