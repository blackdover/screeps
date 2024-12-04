var roleAttacker = {

    run: function(creep) {
        if (!creep.memory.state) {
            creep.memory.state = 'collecting';
        }

        switch(creep.memory.state) {
            case 'collecting':
                // Find the nearest container with energy
                var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
                });
                if (containers.length > 0) {
                    var container = creep.pos.findClosestByPath(containers);
                    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
                        }
                    } else {
                        creep.memory.state = 'moving';
                    }
                } else {
                    // No containers with energy, go idle
                    creep.memory.state = 'idle';
                }
                break;
            case 'moving':
                // Move to position (15,2)
                if (creep.pos.x != 15 || creep.pos.y != 2) {
                    creep.moveTo(15, 3, { visualizePathStyle: { stroke: '#ffffff' } });
                } else {
                    creep.memory.state = 'attacking';
                }
                break;
            case 'attacking':
                // Find NPCs (neutral creeps) to attack
                var npcs = creep.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (creep) => creep.owner && creep.owner.username == 'Neutral'
                });
                if (npcs.length > 0) {
                    var target = creep.pos.findClosestByPath(npcs);
                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
                    }
                } else {
                    // No NPCs to attack
                    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                        // If no energy, go back to collecting
                        creep.memory.state = 'collecting';
                    } else {
                        // Still has energy, wait for NPCs
                    }
                }
                break;
            case 'idle':
                // Handle idle state, look for other tasks
                // For now, just wait
                break;
        }
    }
};

module.exports = roleAttacker;