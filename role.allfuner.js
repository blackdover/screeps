var roleAllFuner = {
    buildPriority: [
        STRUCTURE_SPAWN,
        STRUCTURE_EXTENSION,
        STRUCTURE_CONTAINER,
        STRUCTURE_WALL,
        STRUCTURE_RAMPART,
        STRUCTURE_TOWER,
        STRUCTURE_ROAD,
        // 其他结构类型...
    ],
    run: function(creep) {
        // 状态切换逻辑
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'collecting';
        } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'transferring';
        }
        
        if (creep.memory.state === 'collecting') {
            // 查找最近的能量源并采集
            var source = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: function(s) {
                    return s.id !== '5bbcafdc9099fc012e63b4c5';
                }
            });
            if (source) {
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                // 没有找到能源源，切换到 waiting 状态
                creep.memory.state = 'waiting';
                var waitPosition = new RoomPosition(16, 46, creep.room.name);
                if (creep.pos.isNearTo(waitPosition)) {
                    // 已经在等待位置，保持不动
                } else {
                    creep.moveTo(waitPosition, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        } else if (creep.memory.state === 'waiting') {
            // 在等待位置，检查是否有可用的能源源
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (source && creep.harvest(source) === OK) {
                // 有可用的能源源，切换回 collecting 状态

                creep.memory.state = 'collecting';
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                // 仍然没有可用的能源源，保持在等待位置
                var waitPosition = new RoomPosition(16, 46, creep.room.name);
                if (creep.pos.isNearTo(waitPosition)) {
                    // 已经在等待位置，保持不动
                } else {
                    creep.moveTo(waitPosition, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        } 
        else if (creep.memory.state === 'transferring') {
            // 查找需要能量的目标
            var target = getEnergyTarget(creep);
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } 
            else {
                // 没有需要能量的目标，进入建造逻辑
                // 查找高优先级的建筑工地
                var constructionSites = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, Infinity, {
                    filter: (site) => {
                        return roleAllFuner.buildPriority.includes(site.structureType);
                    }
                });
                
                // 按优先级排序，再按距离排序
                constructionSites.sort((a, b) => {
                    var aIndex = roleAllFuner.buildPriority.indexOf(a.structureType);
                    var bIndex = roleAllFuner.buildPriority.indexOf(b.structureType);
                    if (aIndex !== bIndex) {
                        return aIndex - bIndex;
                    } else {
                        return a.pos.getRangeTo(creep) - b.pos.getRangeTo(creep);
                    }
                });
                
                // 查找低优先级的建筑工地并按距离排序
                var lowPrioritySites = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, Infinity, {
                    filter: (site) => {
                        return !roleAllFuner.buildPriority.includes(site.structureType);
                    }
                });
                lowPrioritySites.sort((a, b) => {
                    return a.pos.getRangeTo(creep) - b.pos.getRangeTo(creep);
                });
                
                // 选择目标建筑工地
                var targetSite = constructionSites[0] || lowPrioritySites[0];
                
                if (targetSite) {
                    if (creep.build(targetSite) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetSite, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                } else {
                    // 修理和升级逻辑
                    var repairTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType === STRUCTURE_ROAD ||
                                    structure.structureType === STRUCTURE_CONTAINER ||
                                    structure.structureType === STRUCTURE_RAMPART ||
                                    structure.structureType === STRUCTURE_WALL) &&
                                   structure.hits < structure.hitsMax * 0.8;
                        }
                    });
                    if (repairTarget) {
                        if (creep.repair(repairTarget) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(repairTarget, { visualizePathStyle: { stroke: '#ffffff' } });
                        }
                    } else {
                        // 升级控制器
                        var controller = creep.room.controller;
                        if (controller) {
                            if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(controller, { visualizePathStyle: { stroke: '#ffffff' } });
                            }
                        }
                    }
                }
            }
        }
    }
};

// 定义获取能量目标的函数
function getEnergyTarget(creep) {
    // 优先查找需要能量的 Extension
    var extensionTargets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_EXTENSION &&
                   structure.store[RESOURCE_ENERGY] < structure.store.getCapacity(RESOURCE_ENERGY);
        }
    });
    if (extensionTargets) {
        return extensionTargets;
    }

    // 如果没有，查找需要能量的 Spawn
    var spawnTargets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_SPAWN &&
                   structure.store[RESOURCE_ENERGY] < structure.store.getCapacity(RESOURCE_ENERGY);
        }
    });
    if (spawnTargets) {
        return spawnTargets;
    }

    // 如果没有，查找需要能量的 Container
    // var containerTargets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    //     filter: (structure) => {
    //         return structure.structureType === STRUCTURE_CONTAINER &&
    //                structure.store[RESOURCE_ENERGY] < structure.store.getCapacity(RESOURCE_ENERGY);
    //     }
    // });
    // if (containerTargets) {
    //     return containerTargets;
    // }

    // 没有需要能量的目标
    return null;
}


module.exports = roleAllFuner;