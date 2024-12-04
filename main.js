var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleDestroyer = require('role.destoryer');
var roleAllFuner = require('role.allfuner');
var roleDancer = require('role.dancer');
var roleExplorer = require('role.explorer');
var roleCarrier = require('role.carrier');
var roleAttacker = require('role.attacker');
var roleRequirer = require('role.requirer');
module.exports.loop = function () {
    
    for (var name in Game.rooms) {
        console.log('Room "' + name + '" has ' + Game.rooms[name].energyAvailable + ' energy.');
    }

    // 修复塔的逻辑
    var tower = Game.getObjectById('674c76942d4418fc1df2d5c3');
    if(tower) {
        // var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        //     filter: (structure) => (structure.hits < structure.hitsMax*0.5 && structure!=STRUCTURE_WALL)
        // });
        // if(closestDamagedStructure) {
        //     tower.repair(closestDamagedStructure);
        // }

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

    // 定义优先级列表
    var priorityList = [
        { role: 'allfuner', targetCount: 6, bodyParts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE] },
        { role: 'carrier', targetCount: 3, bodyParts: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE] },
        { role: 'harvester', targetCount: 1, bodyParts: [WORK, WORK, WORK, WORK, WORK, MOVE] },
        { role: 'upgrader', targetCount: 5, bodyParts: [WORK, WORK,WORK, CARRY, CARRY,CARRY,CARRY, MOVE, MOVE, MOVE, MOVE] },
        { role: 'builder', targetCount: 2, bodyParts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] },
        // { role: 'allfuner', targetCount: 4, bodyParts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] },
        { role: 'requirer', targetCount: 2, bodyParts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] },

    ];

    // checkAndSpawnCreep('harvester', [WORK, WORK, WORK, WORK, WORK, MOVE], 1);
    
    // checkAndSpawnCreep('allfuner', [WORK,CARRY,MOVE], 5);
    // checkAndSpawnCreep('upgrader', [WORK, CARRY, MOVE], 1);       
    // checkAndSpawnCreep('carrier', [CARRY,CARRY,MOVE], 1);

    // checkAndSpawnCreep('harvester', [WORK, WORK, WORK, WORK, WORK, MOVE], 1);
    
    // checkAndSpawnCreep('allfuner', [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], 4);
    // checkAndSpawnCreep('upgrader', [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], 4);
    // checkAndSpawnCreep('builder', [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], 2);
    // checkAndSpawnCreep('requirer', [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 2);   

    // checkAndSpawnCreep('attacker', [ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,TOUGH,TOUGH,TOUGH], 1);        
    // checkAndSpawnCreep('allfuner', [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], 5);
    
    // checkAndSpawnCreep('builder', [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], 4);
    // checkAndSpawnCreep('upgrader', [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], 5);

        
    // 按优先级顺序生成新的 creep
    for (var i = 0; i < priorityList.length; i++) {
        var entry = priorityList[i];
        var creepsOfRole = _.filter(Game.creeps, (creep) => creep.memory.role == entry.role);
        if (creepsOfRole.length < entry.targetCount) {
            var spawn = Game.spawns['Spawn1'];
            if (!spawn) {
                console.log('Spawn not found.');
                continue;
            }
            var spawnCost = getSpawnCost(entry.bodyParts);
            if (spawn.room.energyAvailable >= spawnCost && spawn.spawning == null) {
                var newName = entry.role.charAt(0).toUpperCase() + entry.role.slice(1) + Game.time;
                var result = spawn.spawnCreep(entry.bodyParts, newName, { memory: { role: entry.role } });
                if (result == OK) {
                    console.log('Spawning new ' + entry.role + ': ' + newName);
                    break; // 生成一个后退出循环，等待下一次 tick
                } else {
                    console.log('Failed to spawn ' + entry.role + ': ' + result);
                    break; // 生成失败，不再尝试生成其他优先级的creep
                }
            } else {
                // 能量不足或者spawn忙，不生成，等待下一次循环
                if (spawn.room.energyAvailable < spawnCost) {
                    console.log('Not enough energy to spawn ' + entry.role + '. Available: ' + spawn.room.energyAvailable + ', Required: ' + spawnCost);
                } else {
                    console.log('Spawn is busy spawning another creep.');
                }
                break; // 不生成，不再尝试生成其他优先级的creep
            }
        }
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
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        // if(creep.memory.role == 'destroyer') {
        //     // roleDestroyer.run(creep);
        //     roleHarvester.run(creep); // 示例替代，需根据需要修改
        // }
        if (creep.memory.role == 'allfuner') {
            roleAllFuner.run(creep);
        }
        // Game.spawns['Spawn1'].spawnCreep([MOVE], 'dancer1', { memory: { role: 'dancer' } });
        if (creep.memory.role == 'dancer') {
            roleDancer.run(creep);
        }
        if(creep.memory.role == 'explorer'){
            roleExplorer.run(creep);
        }
        if(creep.memory.role=='carrier'){
             roleCarrier.run(creep);
        }
        if(creep.memory.role=='attacker'){
             roleAttacker.run(creep);
        }
        if (creep.memory.role == 'requirer') {
            roleRequirer.run(creep);
        }
    }
};

// 函数计算生成creep的费用
function getSpawnCost(bodyParts) {
    var cost = 0;
    for(var i in bodyParts) {
        switch(bodyParts[i]) {
            case WORK:
                cost += 100;
                break;
            case MOVE:
                cost += 50;
                break;
            case CARRY:
                cost += 50;
                break;
            case ATTACK:
                cost += 80;
                break;
            case RANGED_ATTACK:
                cost += 150;
                break;
            case HEAL:
                cost += 250;
                break;
            case TOUGH:
                cost += 10;
                break;
            case CLAIM:
                cost += 600;
                break;
        }
    }
    return cost;
};