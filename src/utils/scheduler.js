import { updateRoomsAvailability } from '../rooms/room.controller.js';


const runAvailabilityUpdate = async () => {
  try {
    await updateRoomsAvailability();
  } catch (error) {
    console.error('Error in availability update scheduler:', error);
  }
};


setInterval(runAvailabilityUpdate, 60 * 60 * 1000);


runAvailabilityUpdate(); 