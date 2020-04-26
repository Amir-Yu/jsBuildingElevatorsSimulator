const NUM_OF_FLOORS = 7;
const NUM_OF_ELEVATORS = 2;
const FLOOR_HEIGHT = 50; // px
const DELAY_BETWEEN_FRAMES = 15; //ms

function btnClick(elem, floor) {
  //console.log(elem, floor);
  if (elem.classList) {
    if (elem.classList.length < 2) {
      elem.classList.toggle("on");
      building.goToFloor(floor);
    }
  }
}

const building = {
  floors: NUM_OF_FLOORS,
  floorsMap: new Map(),
  elevators: [],
  waitingList: [],
  addButtonHTML: (floor) => {
    return `<button class='button' id='btn-${floor}' onclick='btnClick(this, ${floor})'>\n
          <div>${floor}</div>
        </button>`;
  },
  clearButtonHTML: (floor) => {
    const elemBtn = document.getElementById(`btn-${floor}`);
    elemBtn.classList.remove("on");
  },
  // init elevators
  initElevators: function () {
    result = "";
    for (let i = 1; i <= NUM_OF_ELEVATORS; i++) {
      this.elevators.push({
        id: i,
        floor: 0,
        busy: false,
        top: FLOOR_HEIGHT * this.floors,
        left: FLOOR_HEIGHT * i,
      });
      result += `<div class='elevator' style='
                top:${this.elevators[i - 1].top}px;
                left:${this.elevators[i - 1].left}px'>
                ${i}</div>`;
    }
    return result;
  },
  // init building
  initBuilding: function () {
    let floorsHTML = "";
    for (let floor = this.floors; floor >= 0; floor--) {
      floorsHTML += `<div id ='floor-${floor}' class='floor'>`;
      floorsHTML += this.addButtonHTML(floor);
      floorsHTML += `</div>`;
      // map floors heights
      this.floorsMap.set(this.floors - floor, floor * FLOOR_HEIGHT);
    }
    return {
      floorsHTML,
      width: (NUM_OF_ELEVATORS + 1) * FLOOR_HEIGHT,
      height: (this.floors + 1) * FLOOR_HEIGHT,
    };
  },
  // prettier-ignore
  goToFloor: (destFloor) => {
    // check if there is an elevator on this floor
    if (building.elevators.filter(x => !x.busy && x.floor == destFloor).length > 0)
    {
      building.clearButtonHTML(destFloor);
      playDingSound();
      return;
    }
    const elevator = building.elevatorPicker(destFloor);
    // no elevator available for the moment so adding to the queue waithinglist
    if (elevator == null) {
      building.waitingList.push(destFloor);
      return;
    }
    let currPos = elevator.top;
    const destPos = building.floorsMap.get(destFloor);
    //const elevatorElem = document.getElementsByClassName("elevator");
    const frame = () => {
      if (currPos == destPos) {
        clearInterval(animate);
        // wait another 2sec (2000ms) before releasing the elevator
        setTimeout(function () {
          building.clearButtonHTML(destFloor);
          elevator.busy = false;
        }, 2000);
        
        playDingSound();
        elevator.floor = destFloor;
        elevator.top = building.floorsMap.get(destFloor);
        if (building.waitingList.length > 0) { // <-- check if the waithinglist queue is not empty
          setTimeout(function () {
            building.goToFloor(building.waitingList.shift());
          }, 2000);
        }
      } else {
        currPos < destPos ? currPos++ : currPos--;
        elevatorElem[elevator.id - 1].style.top = currPos + "px";
      }
    };
    let animate = setInterval(frame, DELAY_BETWEEN_FRAMES);
    elevator.busy = true;
  },
  // prettier-ignore
  elevatorPicker: (destFloor) => {
    const availableElevators = building.elevators.filter(x => !x.busy);
    // no elevator available for the moment ... we'll wait
    if (availableElevators.length == 0) { return; }

    const closestDist = availableElevators.reduce(
      (min, x) => Math.abs(x.floor - destFloor) < min ? Math.abs(x.floor - destFloor) : min, NUM_OF_FLOORS);
    return availableElevators.filter(x => Math.abs(x.floor - destFloor) == closestDist)[0];
  }
};

////////////////////////////////////////////////////////
document.getElementById("elevators").innerHTML = building.initElevators();
const buildingData = building.initBuilding();
const buildingElem = document.getElementById("building");
const containerElem = document.getElementById("container");
const elevatorElem = document.getElementsByClassName("elevator");

containerElem.style.width = buildingData.width + "px";
containerElem.style.height = buildingData.height + "px";
buildingElem.innerHTML = buildingData.floorsHTML;
////////////////////////////////////////////////////////
