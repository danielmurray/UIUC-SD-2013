window.DEBUG = true;

// Debug collection instantiation

window.Lights = new LightCollection();
Lights.add([
  {
    id: "kitchencounter",
    type: "analog",
    zone: "kitchen",
    value: Math.random() * 100
    },
    {
    id: "kitchenpendant",
    type: "analog",
    zone: "kitchen",
    value: Math.random() * 100
    },
    {
    id: "kitchentrack",
    type: "analog",
    zone: "kitchen",
    value: Math.random() * 100
    },
    {
    id: "kitchenaccent",
    type: "rgb",
    zone: "kitchen",
    value: Math.floor(Math.random()*16777215).toString(16)
    },
    {
    id: "bathroomsconce",
    type: "analog",
    zone: "bathroom",
    value: Math.random() * 100
    },
    {
    id: "bathroomtrack",
    type: "analog",
    zone: "bathroom",
    value: Math.random() * 100
    },
    {
    id: "mechanicaltrack",
    type: "analog",
    zone: "mechanical",
    value: Math.random() * 100
    },
    {
    id: "laundrytrack",
    type: "analog",
    zone: "laundry",
    value: Math.random() * 100
    },
    {
    id: "bedroomsconce",
    type: "analog",
    zone: "bedroom",
    value: Math.random() * 100
    },
    {
    id: "bedroomaccent",
    type: "rgb",
    zone: "bedroom",
    value: Math.floor(Math.random()*16777215).toString(16)
    },
    {
    id: "hallwayfixture",
    type: "analog",
    zone: "hallway",
    value: Math.random() * 100
    },
    {
    id: "hallwaytrack",
    type: "analog",
    zone: "hallway",
    value: Math.random() * 100
    },
    {
    id: "closettrack",
    type: "analog",
    zone: "closet",
    value: Math.random() * 100
    },
    {
    id: "livingroomtrack",
    type: "analog",
    zone: "livingroom",
    value: Math.random() * 100
    },
    {
    id: "livingaccent",
    type: "rgb",
    zone: "livingroom",
    value: Math.floor(Math.random()*16777215).toString(16)
    },
    {
    id: "mastersconces",
    type: "analog",
    zone: "master",
    value: Math.random() * 100
    },
    {
    id: "masteraccent",
    type: "rgb",
    zone: "master",
    value: Math.floor(Math.random()*16777215).toString(16)
    }
]);

window.Power = new PowerCollection();
Power.add([
    {
    id: "CERV",
    power: Math.random() * 500
    },
    {
    id: "Oven",
    power: Math.random() * 300
    },
    {
    id: "Fridge",
    power: Math.random() * 100
    },
    {
    id: "Lights",
    power: Math.random() * 50
    },
    {
    id: "North Sockets",
    power: Math.random() * 40
    },
    {
    id: "South Sockets",
    power: Math.random() * 20
    },
    {
    id: "Toaster",
    power: Math.random() * 20
    }
]);

window.PV = new PVCollection();
PV.add([
  {
    id: "PV1",
    power: Math.random() * 100
    },
    {
    id: "PV2",
    power: Math.random() * 100
    },
    {
    id: "PV3",
    power: Math.random() * 100
    },
    {
    id: "PV4",
    power: Math.random() * 100
    },
    {
    id: "PV5",
    power: Math.random() * 100
    },
    {
    id: "PV6",
    power: Math.random() * 100
    },
    {
    id: "PV7",
    power: Math.random() * 100
    },
    {
    id: "PV8",
    power: Math.random() * 100
    },
    {
    id: "PV9",
    power: Math.random() * 100
    },
    {
    id: "PV10",
    power: Math.random() * 100
    },
    {
    id: "PV11",
    power: Math.random() * 100
    },
    {
    id: "PV12",
    power: Math.random() * 100
    },
    {
    id: "PV13",
    power: Math.random() * 100
    },
    {
    id: "PV14",
    power: Math.random() * 100
    },
    {
    id: "PV15",
    power: Math.random() * 100
    }
]);


window.Flow = new FlowCollection();

window.Windoor = new WindoorCollection();
Windoor.add([
  {
    id: "northwindowkitchen",
    zone: "kitchen",
    value: Math.random() * 100
    },
  {
    id: "westwindowkitchen",
    zone: "kitchen",
    value: Math.random() * 100
    },
  {
    id: "northwindowbedzone",
    zone: "bedroom",
    value: Math.random() * 100
    },
  {
    id: "eastwindowbedzone",
    zone: "bedroom",
    value: Math.random() * 100
    },
  {
    id: "westwindowmaster",
    zone: "master",
    value: Math.random() * 100
    },
  {
    id: "southwindowmaster",
    zone: "master",
    value: Math.random() * 100
    },
  {
    id: "southwindowlivingzone1",
    zone: "livingroom",
    value: Math.random() * 100
    },
  {
    id: "southwindowlivingzone2",
    zone: "livingroom",
    value: Math.random() * 100
    },
  {
    id: "westhwindowlivingzone",
    zone: "livingroom",
    value: Math.random() * 100
    }
]);

window.HVAC = new HVACCollection();
HVAC.add([
    {
    id: "bedroom",
    state: "on", //id = room
    avg_temp: Math.random() * 100,
    tar_temp: Math.random() * 100
    }
]);

window.Temp = new TempCollection();
Temp.add([
    {
    id: "bedroom",
    state: "on", //id = room
    avg_temp: Math.random() * 100,
    tar_temp: Math.random() * 100
    }
]);

window.Pyra = new PyraCollection();
Pyra.add([
    {
    id: "bedroom",
    state: "on", //id = room
    avg_temp: Math.random() * 100,
    tar_temp: Math.random() * 100
    }
]);

window.Humid = new HumidCollection();
Humid.add([
    {
    id: "bedroom",
    state: "on", //id = room
    avg_temp: Math.random() * 100,
    tar_temp: Math.random() * 100
    }
]);

window.CO2 = new Co2Collection();
CO2.add([
    {
    id: "bedroom",
    state: "on", //id = room
    avg_temp: Math.random() * 100,
    tar_temp: Math.random() * 100
    }
]);

window.Optimizer = new OptimizerCollection();
Optimizer.add([
    {
    id: "null",
    }
]);

window.HistoryCollections = [
    window.PV,
    window.Pyra,
    window.Power,
    window.Flow,
    window.Temp,
    window.CO2,
    window.Humid
]