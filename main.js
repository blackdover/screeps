var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleDestroyer = require('role.destoryer');
var roleAllFuner = require('role.allfuner');
var roleDancer = require('role.dancer');
var roleExplorer = require('role.explorer');
var roleCarrier = require('role.carrier');
module.exports.loop = function () {
    
    for (var name in Game.rooms) {
        console.log('Room "' + name + '" has ' + Game.rooms[name].energyAvailable + ' energy.');
    }

    // 修复塔的逻辑
    var tower = Game.getObjectById('674c76942d4418fc1df2d5c3');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }

    // 清理死去的 creep 的 memory
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    // 检查并生成 creep，确保每种角色至少有2个，或者 builder 至少为4个，或者总数为8
    var totalCreeps = Object.keys(Game.creeps).length;
    if (totalCreeps <= 14) {
        checkAndSpawnCreep('harvester', [WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE], 1);
        checkAndSpawnCreep('carrier', [CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], 1);
        checkAndSpawnCreep('allfuner', [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], 5);
        checkAndSpawnCreep('builder', [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], 2);
        checkAndSpawnCreep('upgrader', [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], 5);
        // checkAndSpawnCreep('explorer', [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], 3);        
        // checkAndSpawnCreep('destroyer', [ATTACK, MOVE], 2); // 假设 destroyer 需要攻击部件
    }

    // 显示正在孵化的 creep
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    // 让 creep 执行各自的任务
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role === 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role === 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role === 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'destroyer') {
            // roleDestroyer.run(creep);
            roleHarvester.run(creep); // 示例替代，需根据需要修改
        }
        if (creep.memory.role === 'allfuner') {
            roleAllFuner.run(creep);
        }
        // Game.spawns['Spawn1'].spawnCreep([MOVE], 'dancer1', { memory: { role: 'dancer' } });
        if (creep.memory.role === 'dancer') {
            roleDancer.run(creep);
        }
        if(creep.memory.role === 'explorer'){
            roleExplorer.run(creep);
        }
        if(creep.memory.role==='carrier'){
             roleCarrier.run(creep);
        }
    }
};

// 创建缺少的 creep
function checkAndSpawnCreep(role, bodyParts, targetCount = 2) {
    var creepsOfRole = _.filter(Game.creeps, (creep) => creep.memory.role == role);
    console.log(role.charAt(0).toUpperCase() + role.slice(1) + 's: ' + creepsOfRole.length);

    if(creepsOfRole.length < targetCount) {
        var newName = role.charAt(0).toUpperCase() + role.slice(1) + Game.time;
        console.log('Spawning new ' + role + ': ' + newName);
        Game.spawns['Spawn1'].spawnCreep(bodyParts, newName, { memory: { role: role } });
    }
}
