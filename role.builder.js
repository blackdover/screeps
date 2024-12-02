 var roleBuilder={

    run: function (creep) {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 收集');
        }

        if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            let target = this.getEnergyTransferTarget(creep);
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                creep.memory.building = true;
                creep.say('🚧 建造');
            }
        }

        if (!creep.memory.building && creep.store.getFreeCapacity() > 0) {
            this.collectEnergy(creep);
        }

        if (creep.memory.building) {
            this.buildLogic(creep);
        } else {
            this.idleLogic(creep);
        }
    },

    collectEnergy: function (creep) {
        let energySources = creep.room.find(FIND_SOURCES);
        energySources = energySources.concat(creep.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
        }));

        if (energySources.length == 0) {
            creep.say('_No Energy');
            return;
        }

        let target = energySources.sort((a, b) => {
            return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
        })[0];

        if (creep.pos.isNearTo(target)) {
            if (target.structureType == STRUCTURE_CONTAINER) {
                creep.withdraw(target, RESOURCE_ENERGY);
            } else {
                creep.harvest(target);
            }
        } else {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    },

    buildLogic: function (creep) {
        let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (sites.length == 0) {
            creep.memory.building = false;
            creep.say('💤 休息');
            return;
        }

        let targetSite = sites.sort((a, b) => {
            return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
        })[0];

        if (creep.build(targetSite) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetSite, { visualizePathStyle: { stroke: '#ffffff' } });
        }
    },

    getEnergyTransferTarget: function (creep) {
        let target = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_EXTENSION && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)
        })[0];

        if (!target) {
            target = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_SPAWN && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)
            })[0];
        }

        return target;
    },

    idleLogic: function (creep) {
        let spawn = creep.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_SPAWN })[0];
        if (spawn) {
            creep.moveTo(spawn, { visualizePathStyle: { stroke: '#ff0000' } });
        }
    },
};

module.exports =roleBuilder;