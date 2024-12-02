var roleExplorer = {
    buildPriority: [
        STRUCTURE_CONTAINER,
        STRUCTURE_ROAD,
        // STRUCTURE_SPAWN,
        STRUCTURE_WALL,
        STRUCTURE_RAMPART,
        STRUCTURE_TOWER,
        STRUCTURE_EXTENSION,
        // 其他结构类型...
    ],
    run: function(creep) {
        var targetRoomName = 'E47N39'; // 目标房间名称
        var homeRoomName = 'E48N39';   // 主房间名称

        // 状态切换逻辑
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'collecting';
        } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'transferring';
        }

        // 根据当前状态执行不同的任务
        if (creep.memory.state === 'collecting') {
            // 前往目标房间并采集能量
            if (creep.room.name !== targetRoomName) {
                creep.moveTo(new RoomPosition(25, 25, targetRoomName), { visualizePathStyle: { stroke: '#ffaa00' } });
            } else {
                // 在目标房间采集最近的能量源
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (source) {
                    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                } else {
                    // 如果没有能量源，可以设定一个默认位置或等待
                }
            }
        } else if (creep.memory.state === 'transferring') {
            // 返回本房间并传输能量
            if (creep.room.name !== homeRoomName) {
                creep.moveTo(new RoomPosition(25, 25, homeRoomName), { visualizePathStyle: { stroke: '#ffffff' } });
            } else {
                // 查找需要能量的目标
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_SPAWN ||
                                structure.structureType === STRUCTURE_EXTENSION) &&
                                structure.store[RESOURCE_ENERGY] < structure.store.getCapacity(RESOURCE_ENERGY);
                    }
                });
                if (target) {
                    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                } else {
                    // 查找高优先级的建筑工地
                    var constructionSites = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, Infinity, {
                        filter: (site) => {
                            return roleExplorer.buildPriority.includes(site.structureType);
                        }
                    });
                    
                    // 按优先级排序，再按距离排序
                    constructionSites.sort((a, b) => {
                        var aIndex = roleExplorer.buildPriority.indexOf(a.structureType);
                        var bIndex = roleExplorer.buildPriority.indexOf(b.structureType);
                        if (aIndex !== bIndex) {
                            return aIndex - bIndex;
                        } else {
                            return a.pos.getRangeTo(creep) - b.pos.getRangeTo(creep);
                        }
                    });
                    
                    // 查找低优先级的建筑工地并按距离排序
                    var lowPrioritySites = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, Infinity, {
                        filter: (site) => {
                            return !roleExplorer.buildPriority.includes(site.structureType);
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

module.exports = roleExplorer;