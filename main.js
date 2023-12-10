const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);

const N=300;
let cars=generateCars(N);
let bestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.15);
        }
    }
}
let initialBrain = bestCar.brain

let traffic=[
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-700,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-900,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-900,30,50,"DUMMY",2,getRandomColor()),
]

animate();

function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N, lane=1, y = 100){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(lane),y,30,50,"AI"));
    }
    return cars;
}

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }

    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    if (bestCar) {
        const yAxisLimit = bestCar.y + 300
        cars = cars.filter(car => car.y < yAxisLimit || !car.damaged )

        traffic = traffic.filter(car => car.y < yAxisLimit )

        console.log('Trafico:', traffic.length, traffic)
        if (traffic.length < 5) {
            console.log('Se crea trafico')
            const randomLane = Math.floor(Math.random() * 3) % 3
            const yAxisRow = bestCar.y - 400
            
            const newTrafficCar = new Car(road.getLaneCenter(randomLane), yAxisRow,30,50,"DUMMY",2,getRandomColor())
            newTrafficCar.update(road.borders,[]);
            traffic.push(newTrafficCar)
        }
        /*
        if (cars.length < 40) {
            const randomLane = Math.floor(Math.random() * 3) % 3
            const newAICars = generateCars(15, randomLane, bestCar.y)
            newAICars.forEach(newCar => {
                newCar.brain=initialBrain
                NeuralNetwork.mutate(newCar.brain,0.12);
                newCar.update(road.borders,traffic);
            });
            cars = cars.concat(newAICars)
           
        }*/
    }

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}