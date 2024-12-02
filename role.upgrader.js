var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // 状态切换逻辑
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false; // 切换到采集状态
            creep.say('🔄 harvest');
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true; // 切换到升级状态
            creep.say('⚡ upgrade');
        }

        // 升级控制器逻辑
        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        } else {
            // 采集能量逻辑
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
            });
            var closestContainer = creep.pos.findClosestByPath(containers);
            if (closestContainer) {
                if (creep.withdraw(closestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestContainer, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                var excludedSourceId = '5bbcafdc9099fc012e63b4c5';
                var sources = creep.room.find(FIND_SOURCES, {
                    filter: (source) => source.id !== excludedSourceId
                });
                if (sources.length > 0) {
                    var closestSource = creep.pos.findClosestByPath(sources);
                    if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        }
    }
};

module.exports = roleUpgrader;