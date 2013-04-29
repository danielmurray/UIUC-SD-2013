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

window.PV = new PVCollection();
PV.add([
  {
    id: "PV1",
    value: Math.random() * 100
    },
    {
    id: "PV2",
    value: Math.random() * 100
    },
    {
    id: "PV3",
    value: Math.random() * 100
    },
    {
    id: "PV4",
    value: Math.random() * 100
    },
    {
    id: "PV5",
    value: Math.random() * 100
    },
    {
    id: "PV6",
    value: Math.random() * 100
    },
    {
    id: "PV7",
    value: Math.random() * 100
    },
    {
    id: "PV8",
    value: Math.random() * 100
    },
    {
    id: "PV9",
    value: Math.random() * 100
    },
    {
    id: "PV10",
    value: Math.random() * 100
    },
    {
    id: "PV11",
    value: Math.random() * 100
    },
    {
    id: "PV12",
    value: Math.random() * 100
    },
    {
    id: "PV13",
    value: Math.random() * 100
    },
    {
    id: "PV14",
    value: Math.random() * 100
    },
    {
    id: "PV15",
    value: Math.random() * 100
    }
]);


window.Water = new WaterCollection();
Water.add([
  {
    id: "kitchensink",
    room: "kitchen",
    value: Math.random() * 100
    },
  {
    id: "dishwasher",
    room: "kitchen",
    value: Math.random() * 100
    },
  {
    id: "refrigerator",
    room: "kitchen",
    value: Math.random() * 100
    },
  {
    id: "washingmachine",
    room: "laundry",
    value: Math.random() * 100
    },
  {
    id: "bathroomsink",
    room: "bathroom",
    value: Math.random() * 100
    },
  {
    id: "shower",
    room: "bathroom",
    value: Math.random() * 100
    },
  {
    id: "toilet",
    room: "bathroom",
    value: Math.random() * 100
    },
  {
    id: "hotwatertank",
    room: "kitchen",
    value: Math.random() * 100
    }
]);

window.Blinds = new BlindCollection();
Blinds.add([
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

window.Flow = new FlowCollection();
Flow.add([
    {
    id: "bedroom",
    state: "on", //id = room
    avg_temp: Math.random() * 100,
    tar_temp: Math.random() * 100
    }
]);

window.Windoor = new WindoorCollection();
Windoor.add([
    {
    id: "6",
    zone: "room-1",
    value: '1'
    }
]);

window.Power = new PowerCollection();
Power.add([
    {
    id: "bedroom",
    state: "on", //id = room
    avg_temp: Math.random() * 100,
    tar_temp: Math.random() * 100
    }
]);