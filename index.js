const gremlin = require('gremlin')

const P = gremlin.process.P
const __ = gremlin.process.statics

const Graph = gremlin.structure.Graph
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const graph = new Graph();
const g = graph.traversal().withRemote(new DriverRemoteConnection('ws://localhost:8182/gremlin'))

const initGraph = async () => {
    await g.V().drop().iterate()

    await g.addV("carrier").property("name", "UPS").as("UPS")
        .addV("carrier").property("name", "PostNL").as("PostNL")
        .addV("carrier").property("name", "DHL").as("DHL").addV("zone").property("zip", "1234").property("country", "NL").as("ZoneNL1234")
        .addV("carrier").property("name", "DHL").as("DHL").addV("zone").property("zip", "6546").property("country", "DE").as("ZoneDE6546")
        .addE("delivers").from_("UPS").to("ZoneNL1234").property("days", "3").property("rate", "5 USD")
        .addE("delivers").from_("UPS").to("ZoneDE6546").property("days", "4").property("rate", "2 USD")
        .addE("delivers").from_("DHL").to("ZoneNL1234").property("days", "1").property("rate", "4 USD")
        .addE("delivers").from_("DHL").to("ZoneDE6546").property("days", "2").property("rate", "3 USD")
        .addE("delivers").from_("PostNL").to("ZoneNL1234").property("days", "4").property("rate", "2 USD").iterate()

}

const listCarrierServicesDeliveringIntoZone = async (zip) => {
    // return await g.V().has("zone", "zip", zip).in_("delivers").values('name').toList()
    return await g.V().has("zone", "zip", zip).inE("delivers").as("transit", "rate")
        .outV().as("zone").select("transit", "rate", "zone").by("days").by("rate").by("name").toList()
}

const listZonesThatCarrierServiceDeliversTo = async (carrierName) => {
    return await g.V().has("carrier", "name", carrierName).out("delivers").valueMap().toList()
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
