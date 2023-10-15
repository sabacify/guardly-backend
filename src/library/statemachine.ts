import StateMachine from "javascript-state-machine";

export enum STATES {
  IDLE = "idle",
  IN_TRANSIT = "in_transit",
  COMPLETED = "completed"
}

const fsm = new StateMachine({
  init: STATES.IDLE,
  transitions: [
    { 
      name: 'start',
      from: STATES.IDLE,
      to: STATES.IN_TRANSIT
    },
    { 
      name: 'end',
      from: STATES.IN_TRANSIT, 
      to: STATES.COMPLETED
    },
  ],
  methods: {
    onStart: function() { 
      console.log('on ride started')
    },
    onEnd: function() {
      console.log('on ride ended')
    }
  }
});

export default fsm;