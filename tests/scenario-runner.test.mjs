import test from "node:test";
import assert from "node:assert/strict";
import { runScenario, sampleScenario } from "../src/scenario-runner.js";
import { telemetryCSV } from "../src/suite-contract.js";
test("escenario reproducible sin navegador",()=>{
 const a=runScenario(sampleScenario),b=runScenario(sampleScenario);
 assert.deepEqual(a,b);
 assert.equal(a.snapshot.scan,150);
 assert.equal(a.snapshot.simulatedMs,15000);
 assert.ok(a.events.some(x=>x.message.includes("jam")));
});
test("CSV exportable con muestras del laboratorio",()=>{
 const r=runScenario({schema:1,scenario:"rack",scans:10,events:[{at:0,action:"start"}]});
 assert.equal(r.samples.length,10);
 assert.equal(telemetryCSV(r.samples).trim().split("\r\n").length,11);
});
test("eventos fuera de intervalo se rechazan",()=>{
 assert.throws(()=>runScenario({schema:1,scenario:"rack",scans:5,
   events:[{at:5,action:"start"}]}),/Evento inválido/);
});
test("fuerza y liberación de sensor durante un escenario",()=>{
 const r=runScenario({schema:1,scenario:"conveyor",scans:6,events:[
 {at:0,action:"force",tag:"I0.3",value:true},{at:3,action:"force",tag:"I0.3",value:null}
 ]});
 assert.equal(r.samples[0].cpu.inputs["I0.3"],true);
 assert.equal(r.samples[5].forces["I0.3"],undefined);
});
