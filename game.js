class TowerDefense {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Игровое состояние
        this.gameRunning = false;
        this.gameStarted = false;
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.placingTower = false;
        this.difficulty = 'easy';
        this.weatherEffect = null;
        this.weatherDuration = 0;
        
        // Ресурсы
        this.gold = 500;
        this.lives = 20;
        this.wave = 1;
        this.enemiesKilled = 0;
        this.totalGoldEarned = 0;
        this.score = 0;
        this.researchPoints = 0;
        this.energy = 100;
        this.maxEnergy = 100;
        this.production = 5;
        this.crystals = 0;
        this.gameTime = 0;
        this.currentPlanet = 'earth';
        this.experience = 0;
        this.playerLevel = 1;
        this.experienceToNext = 100;
        
        // Экономические здания
        this.buildings = {
            generators: 0,
            mines: 0,
            factories: 0
        };
        
        // Дипломатия
        this.factions = {
            alliance: { reputation: 50, status: 'neutral' },
            pirates: { reputation: 20, status: 'hostile' },
            traders: { reputation: 80, status: 'friendly' }
        };
        
        // Множественные пути
        this.paths = [
            // Основной путь
            [
                {x: -50, y: 200},
                {x: 200, y: 200},
                {x: 200, y: 400},
                {x: 500, y: 400},
                {x: 500, y: 100},
                {x: 800, y: 100},
                {x: 800, y: 500},
                {x: 1050, y: 500}
            ],
            // Воздушный путь
            [
                {x: -50, y: 100},
                {x: 300, y: 100},
                {x: 600, y: 300},
                {x: 900, y: 200},
                {x: 1050, y: 400}
            ],
            // Подземный путь
            [
                {x: -50, y: 600},
                {x: 150, y: 600},
                {x: 400, y: 550},
                {x: 700, y: 600},
                {x: 1050, y: 600}
            ]
        ];
        
        // Ресурсные узлы
        this.resourceNodes = [
            {x: 150, y: 300, type: 'gold', amount: 50, respawnTime: 30000, lastHarvest: 0},
            {x: 400, y: 200, type: 'crystal', amount: 1, respawnTime: 60000, lastHarvest: 0},
            {x: 650, y: 450, type: 'energy', amount: 25, respawnTime: 20000, lastHarvest: 0},
            {x: 850, y: 300, type: 'gold', amount: 75, respawnTime: 45000, lastHarvest: 0}
        ];
        
        // Порталы
        this.portals = [
            {x: 100, y: 500, targetX: 900, targetY: 150, active: false, cooldown: 0},
            {x: 500, y: 50, targetX: 500, targetY: 650, active: false, cooldown: 0}
        ];
        
        // Щитовые генераторы
        this.shields = [];
        
        // Временные эффекты
        this.timeEffects = {
            slowMotion: { active: false, duration: 0, strength: 1 },
            timeWarp: { active: false, duration: 0, strength: 1 },
            stasis: { active: false, duration: 0 }
        };
        
        // Система квестов
        this.quests = {
            active: [],
            completed: [],
            daily: [],
            available: []
        };
        
        this.questTemplates = {
            // Боевые квесты
            killEnemies: {
                id: 'kill_enemies',
                title: 'Истребитель',
                description: 'Уничтожьте {target} врагов',
                type: 'combat',
                difficulty: 'easy',
                target: 50,
                reward: { experience: 100, gold: 200, crystals: 1 },
                icon: 'fas fa-skull'
            },
            killBoss: {
                id: 'kill_boss',
                title: 'Убийца боссов',
                description: 'Уничтожьте {target} боссов',
                type: 'combat',
                difficulty: 'hard',
                target: 3,
                reward: { experience: 500, gold: 1000, crystals: 5 },
                icon: 'fas fa-dragon'
            },
            surviveWaves: {
                id: 'survive_waves',
                title: 'Выживший',
                description: 'Выдержите {target} волн подряд',
                type: 'survival',
                difficulty: 'medium',
                target: 20,
                reward: { experience: 300, gold: 500, crystals: 2 },
                icon: 'fas fa-shield-alt'
            },
            
            // Экономические квесты
            earnGold: {
                id: 'earn_gold',
                title: 'Золотоискатель',
                description: 'Заработайте {target} золота',
                type: 'economy',
                difficulty: 'easy',
                target: 5000,
                reward: { experience: 150, crystals: 2 },
                icon: 'fas fa-coins'
            },
            buildTowers: {
                id: 'build_towers',
                title: 'Архитектор',
                description: 'Постройте {target} башен',
                type: 'building',
                difficulty: 'easy',
                target: 25,
                reward: { experience: 200, gold: 300 },
                icon: 'fas fa-chess-rook'
            },
            upgradeTowers: {
                id: 'upgrade_towers',
                title: 'Инженер',
                description: 'Улучшите {target} башен',
                type: 'building',
                difficulty: 'medium',
                target: 10,
                reward: { experience: 250, gold: 400, crystals: 1 },
                icon: 'fas fa-arrow-up'
            },
            
            // Исследовательские квесты
            completeResearch: {
                id: 'complete_research',
                title: 'Ученый',
                description: 'Завершите {target} исследований',
                type: 'research',
                difficulty: 'medium',
                target: 5,
                reward: { experience: 400, gold: 600, crystals: 3 },
                icon: 'fas fa-flask'
            },
            
            // Специальные квесты
            perfectWave: {
                id: 'perfect_wave',
                title: 'Идеальная защита',
                description: 'Завершите волну без потери жизней',
                type: 'special',
                difficulty: 'hard',
                target: 1,
                reward: { experience: 600, gold: 1000, crystals: 4 },
                icon: 'fas fa-star'
            },
            useAbilities: {
                id: 'use_abilities',
                title: 'Тактик',
                description: 'Используйте способности {target} раз',
                type: 'tactical',
                difficulty: 'easy',
                target: 10,
                reward: { experience: 180, gold: 250 },
                icon: 'fas fa-magic'
            },
            
            // Дипломатические квесты
            improveDiplomacy: {
                id: 'improve_diplomacy',
                title: 'Дипломат',
                description: 'Улучшите отношения с любой фракцией до "Дружелюбно"',
                type: 'diplomacy',
                difficulty: 'medium',
                target: 1,
                reward: { experience: 350, gold: 500, crystals: 2 },
                icon: 'fas fa-handshake'
            },
            
            // Легендарные квесты
            masterDefender: {
                id: 'master_defender',
                title: 'Мастер обороны',
                description: 'Достигните 50 волны',
                type: 'legendary',
                difficulty: 'legendary',
                target: 50,
                reward: { experience: 2000, gold: 5000, crystals: 20 },
                icon: 'fas fa-crown'
            },
            
            // Ежедневные квесты
            dailyKills: {
                id: 'daily_kills',
                title: 'Ежедневная охота',
                description: 'Уничтожьте {target} врагов сегодня',
                type: 'daily',
                difficulty: 'easy',
                target: 100,
                reward: { experience: 200, gold: 300, crystals: 1 },
                icon: 'fas fa-calendar-day',
                resetDaily: true
            },
            dailyWaves: {
                id: 'daily_waves',
                title: 'Ежедневная защита',
                description: 'Выдержите {target} волн сегодня',
                type: 'daily',
                difficulty: 'medium',
                target: 15,
                reward: { experience: 300, gold: 500, crystals: 2 },
                icon: 'fas fa-calendar-day',
                resetDaily: true
            }
        };
        
        this.questProgress = {};
        this.questNotifications = [];
        this.lastDailyReset = Date.now();
        
        // Исследования
        this.research = {
            damage: 0,
            range: 0,
            speed: 0,
            economy: 0
        };
        
        // Способности
        this.abilities = {
            airstrike: { cooldown: 0, cost: 300, duration: 30000 },
            freeze: { cooldown: 0, cost: 200, duration: 20000 },
            repair: { cooldown: 0, cost: 400, duration: 45000 }
        };
        
        // Достижения
        this.achievements = {
            firstKill: false,
            wave10: false,
            perfectWave: false,
            economyMaster: false,
            researcher: false,
            survivor: false
        };
        
        // Волны
        this.currentWave = [];
        this.waveInProgress = false;
        this.enemiesSpawned = 0;
        this.waveSize = 10;
        this.timeBetweenEnemies = 1000;
        this.lastEnemySpawn = 0;
        this.bossWave = false;
        this.perfectWaveKills = 0;
        
        // Игровые объекты
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
        this.damageNumbers = [];
        this.weatherParticles = [];
        
        this.initializeGameData();
        this.initializeElements();
        this.bindEvents();
        this.gameLoop();
        this.startWeatherSystem();
    }
    
    initializeGameData() {
        // Путь для врагов
        this.path = [
            {x: -50, y: 200},
            {x: 200, y: 200},
            {x: 200, y: 400},
            {x: 500, y: 400},
            {x: 500, y: 100},
            {x: 800, y: 100},
            {x: 800, y: 500},
            {x: 1050, y: 500}
        ];
        
        // Расширенные типы башен с новыми механиками
        this.towerTypes = {
            basic: {
                name: 'Базовая башня',
                cost: 50,
                damage: 25,
                range: 80,
                fireRate: 1000,
                color: '#3498db',
                projectileSpeed: 5,
                upgradeCost: 30,
                sellValue: 25,
                accuracy: 0.95,
                critChance: 0.05,
                specializations: ['rapid_fire', 'armor_piercing']
            },
            sniper: {
                name: 'Снайперская башня',
                cost: 150,
                damage: 100,
                range: 150,
                fireRate: 2000,
                color: '#27ae60',
                projectileSpeed: 8,
                upgradeCost: 75,
                sellValue: 75,
                accuracy: 0.98,
                critChance: 0.25,
                piercing: true,
                specializations: ['explosive_rounds', 'double_shot']
            },
            rapid: {
                name: 'Скорострельная',
                cost: 100,
                damage: 15,
                range: 60,
                fireRate: 300,
                color: '#e74c3c',
                projectileSpeed: 6,
                upgradeCost: 50,
                sellValue: 50,
                accuracy: 0.85,
                critChance: 0.1,
                spinUp: true,
                specializations: ['chain_gun', 'incendiary']
            },
            splash: {
                name: 'Взрывная башня',
                cost: 200,
                damage: 50,
                range: 70,
                fireRate: 1500,
                color: '#f39c12',
                projectileSpeed: 4,
                splashRadius: 40,
                upgradeCost: 100,
                sellValue: 100,
                accuracy: 0.9,
                critChance: 0.15,
                burnEffect: true,
                specializations: ['napalm', 'cluster_bomb']
            },
            freeze: {
                name: 'Ледяная башня',
                cost: 120,
                damage: 20,
                range: 90,
                fireRate: 800,
                color: '#3498db',
                projectileSpeed: 5,
                slowEffect: 0.5,
                slowDuration: 2000,
                upgradeCost: 60,
                sellValue: 60,
                accuracy: 0.92,
                critChance: 0.08,
                freezeChance: 0.1,
                specializations: ['absolute_zero', 'ice_storm']
            },
            laser: {
                name: 'Лазерная башня',
                cost: 300,
                damage: 40,
                range: 100,
                fireRate: 100,
                color: '#9b59b6',
                continuous: true,
                overheat: true,
                overheatThreshold: 50,
                cooldownRate: 2,
                upgradeCost: 150,
                sellValue: 150,
                accuracy: 1.0,
                critChance: 0.2,
                specializations: ['beam_splitter', 'overcharge']
            },
            poison: {
                name: 'Ядовитая башня',
                cost: 180,
                damage: 30,
                range: 85,
                fireRate: 1200,
                color: '#27ae60',
                projectileSpeed: 4,
                poisonDamage: 5,
                poisonDuration: 3000,
                gasCloud: true,
                upgradeCost: 90,
                sellValue: 90,
                accuracy: 0.88,
                critChance: 0.12,
                specializations: ['toxic_cloud', 'corrosive_acid']
            },
            tesla: {
                name: 'Тесла башня',
                cost: 250,
                damage: 60,
                range: 95,
                fireRate: 1800,
                color: '#f1c40f',
                chainLightning: true,
                chainTargets: 3,
                stunChance: 0.3,
                stunDuration: 1000,
                upgradeCost: 125,
                sellValue: 125,
                accuracy: 0.95,
                critChance: 0.18,
                specializations: ['storm_caller', 'emp_burst']
            },
            orbital: {
                name: 'Орбитальная пушка',
                cost: 500,
                damage: 200,
                range: 1000,
                fireRate: 5000,
                color: '#f1c40f',
                orbital: true,
                energyCost: 20,
                upgradeCost: 250,
                sellValue: 250,
                accuracy: 1.0,
                critChance: 0.4,
                specializations: ['nuclear_strike', 'satellite_swarm']
            },
            quantum: {
                name: 'Квантовая башня',
                cost: 400,
                damage: 80,
                range: 120,
                fireRate: 1000,
                color: '#9b59b6',
                quantum: true,
                phaseShift: true,
                teleportChance: 0.3,
                upgradeCost: 200,
                sellValue: 200,
                accuracy: 0.9,
                critChance: 0.25,
                specializations: ['quantum_entanglement', 'dimensional_rift']
            },
            shield: {
                name: 'Щитовой генератор',
                cost: 350,
                damage: 0,
                range: 150,
                fireRate: 0,
                color: '#3498db',
                shield: true,
                shieldStrength: 500,
                shieldRegen: 5,
                energyCost: 10,
                upgradeCost: 175,
                sellValue: 175,
                specializations: ['energy_barrier', 'reflective_shield']
            }
        };
        
        // Расширенные типы врагов с новыми механиками
        this.enemyTypes = {
            basic: {
                health: 100,
                speed: 1,
                reward: 10,
                color: '#e74c3c',
                size: 15,
                armor: 0,
                resistances: {}
            },
            fast: {
                health: 60,
                speed: 2,
                reward: 15,
                color: '#f39c12',
                size: 12,
                armor: 0,
                resistances: {},
                dodge: 0.1
            },
            tank: {
                health: 300,
                speed: 0.5,
                reward: 25,
                color: '#34495e',
                size: 20,
                armor: 5,
                resistances: { splash: 0.5 }
            },
            flying: {
                health: 80,
                speed: 1.5,
                reward: 20,
                color: '#9b59b6',
                size: 14,
                flying: true,
                armor: 0,
                resistances: { freeze: 0.7 }
            },
            regenerating: {
                health: 150,
                speed: 0.8,
                reward: 30,
                color: '#27ae60',
                size: 16,
                armor: 2,
                regeneration: 2,
                resistances: { poison: 0.8 }
            },
            shielded: {
                health: 120,
                speed: 1.2,
                reward: 35,
                color: '#3498db',
                size: 17,
                armor: 0,
                shield: 50,
                shieldRegen: 1,
                resistances: { laser: 0.6 }
            },
            boss: {
                health: 2000,
                speed: 0.3,
                reward: 200,
                color: '#8e44ad',
                size: 35,
                armor: 10,
                shield: 500,
                abilities: ['summon_minions', 'rage_mode'],
                resistances: { freeze: 0.9, poison: 0.9 },
                isBoss: true
            },
            stealth: {
                health: 90,
                speed: 1.8,
                reward: 40,
                color: '#2c3e50',
                size: 13,
                armor: 0,
                stealth: true,
                stealthDuration: 3000,
                resistances: { laser: 0.8 }
            },
            berserker: {
                health: 200,
                speed: 0.7,
                reward: 45,
                color: '#c0392b',
                size: 18,
                armor: 3,
                rage: true,
                rageThreshold: 0.5,
                resistances: { splash: 0.3 }
            },
            teleporter: {
                health: 100,
                speed: 1.5,
                reward: 50,
                color: '#8e44ad',
                size: 15,
                armor: 1,
                teleport: true,
                teleportChance: 0.2,
                teleportRange: 100,
                resistances: { quantum: 0.9 }
            },
            swarm: {
                health: 30,
                speed: 2.5,
                reward: 8,
                color: '#e67e22',
                size: 8,
                armor: 0,
                swarm: true,
                spawnCount: 5,
                resistances: {}
            },
            titan: {
                health: 1500,
                speed: 0.2,
                reward: 150,
                color: '#34495e',
                size: 40,
                armor: 15,
                shield: 300,
                abilities: ['earthquake', 'spawn_minions'],
                resistances: { freeze: 0.8, poison: 0.7, splash: 0.4 },
                isTitan: true
            },
            phantom: {
                health: 120,
                speed: 1.0,
                reward: 60,
                color: '#9b59b6',
                size: 16,
                armor: 0,
                phaseShift: true,
                phaseChance: 0.4,
                flying: true,
                resistances: { basic: 0.5, rapid: 0.5 }
            },
            cybernetic: {
                health: 180,
                speed: 1.3,
                reward: 55,
                color: '#1abc9c',
                size: 17,
                armor: 4,
                shield: 80,
                adaptation: true,
                resistances: { tesla: 0.6 }
            }
        };
    }
    
    initializeElements() {
        this.goldElement = document.getElementById('gold');
        this.livesElement = document.getElementById('lives');
        this.waveElement = document.getElementById('wave');
        this.killedElement = document.getElementById('killed');
        this.scoreElement = document.getElementById('score');
        this.difficultyElement = document.getElementById('difficulty');
        this.researchPointsElement = document.getElementById('researchPoints');
        this.waveProgressElement = document.getElementById('waveProgress');
        this.energyElement = document.getElementById('energy');
        this.productionElement = document.getElementById('production');
        this.crystalsElement = document.getElementById('crystals');
        this.planetElement = document.getElementById('planet');
        this.gameTimerElement = document.getElementById('gameTimer');
        this.experienceElement = document.getElementById('experience');
        this.playerLevelElement = document.getElementById('playerLevel');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.upgradePanel = document.getElementById('upgradePanel');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.startWaveButton = document.getElementById('startWave');
        this.upgradeTowerButton = document.getElementById('upgradeTower');
        this.specializeTowerButton = document.getElementById('specializeTower');
        this.sellTowerButton = document.getElementById('sellTower');
        this.airstrikeButton = document.getElementById('airstrikeBtn');
        this.freezeButton = document.getElementById('freezeBtn');
        this.repairButton = document.getElementById('repairBtn');
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.startWaveButton.addEventListener('click', () => this.startWave());
        this.upgradeTowerButton.addEventListener('click', () => this.upgradeTower());
        this.specializeTowerButton.addEventListener('click', () => this.specializeTower());
        this.sellTowerButton.addEventListener('click', () => this.sellTower());
        
        // Способности
        this.airstrikeButton.addEventListener('click', () => this.useAbility('airstrike'));
        this.freezeButton.addEventListener('click', () => this.useAbility('freeze'));
        this.repairButton.addEventListener('click', () => this.useAbility('repair'));
        
        // Выбор башен
        document.querySelectorAll('.tower-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const towerType = e.currentTarget.dataset.tower;
                this.selectTowerType(towerType);
            });
        });
        
        // Здания
        document.querySelectorAll('.building-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const buildingType = e.currentTarget.dataset.building;
                this.purchaseBuilding(buildingType);
            });
        });
        
        // Крафт
        document.querySelectorAll('.craft-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const craftType = e.currentTarget.dataset.craft;
                this.craftItem(craftType);
            });
        });
        
        // Клики по ресурсным узлам
        this.canvas.addEventListener('dblclick', (e) => this.handleResourceClick(e));
        
        // Квестовые табы
        document.querySelectorAll('.quest-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchQuestTab(e.currentTarget.dataset.tab);
            });
        });
        
        // Клики по canvas
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Клавиши
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelTowerPlacement();
            }
            if (e.key === '1') this.selectTowerType('basic');
            if (e.key === '2') this.selectTowerType('sniper');
            if (e.key === '3') this.selectTowerType('rapid');
            if (e.key === '4') this.selectTowerType('splash');
            if (e.key === '5') this.selectTowerType('freeze');
            if (e.key === '6') this.selectTowerType('laser');
            if (e.key === '7') this.selectTowerType('poison');
            if (e.key === '8') this.selectTowerType('tesla');
        });
    }
    
    startWeatherSystem() {
        setInterval(() => {
            if (this.gameRunning && Math.random() < 0.1) {
                this.changeWeather();
            }
        }, 30000);
    }
    
    changeWeather() {
        const weathers = ['rain', 'storm', 'clear'];
        const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
        
        if (newWeather !== 'clear') {
            this.weatherEffect = newWeather;
            this.weatherDuration = 15000 + Math.random() * 15000;
            this.showEffect(`Погода изменилась: ${newWeather === 'rain' ? 'Дождь' : 'Гроза'}!`, '#3498db');
            
            if (newWeather === 'storm') {
                // Гроза увеличивает урон электрических башен
                this.towers.forEach(tower => {
                    if (tower.type === 'tesla' || tower.type === 'laser') {
                        tower.weatherBonus = 1.5;
                    }
                });
            }
        } else {
            this.weatherEffect = null;
            this.towers.forEach(tower => {
                tower.weatherBonus = 1;
            });
        }
        
        this.createWeatherEffects();
    }
    
    createWeatherEffects() {
        if (this.weatherEffect === 'rain') {
            for (let i = 0; i < 50; i++) {
                this.weatherParticles.push({
                    x: Math.random() * this.canvas.width,
                    y: -10,
                    speed: 5 + Math.random() * 3,
                    type: 'rain'
                });
            }
        } else if (this.weatherEffect === 'storm') {
            if (Math.random() < 0.1) {
                this.createLightning();
            }
        }
    }
    
    createLightning() {
        const flash = document.createElement('div');
        flash.className = 'lightning-flash';
        this.canvas.parentElement.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 200);
        
        // Урон случайным врагам
        const targets = this.enemies.slice(0, 3);
        targets.forEach(enemy => {
            enemy.health -= 50;
            this.createDamageNumber(enemy.x, enemy.y, 50, true);
        });
    }
    
    purchaseResearch(type) {
        const costs = { damage: 5, range: 4, speed: 6, economy: 8 };
        const cost = costs[type] * (this.research[type] + 1);
        
        if (this.researchPoints >= cost && this.research[type] < 5) {
            this.researchPoints -= cost;
            this.research[type]++;
            
            this.onResearchCompleted();
            this.updateResearchUI();
            this.showEffect(`Исследование завершено: ${type}!`, '#9b59b6');
            
            if (this.research[type] === 5) {
                this.unlockAchievement('researcher');
            }
        }
    }
    
    updateResearchUI() {
        document.querySelectorAll('.research-item').forEach(item => {
            const type = item.dataset.research;
            const level = this.research[type];
            const progress = (level / 5) * 100;
            
            const progressBar = item.querySelector('.progress-bar');
            progressBar.style.width = progress + '%';
            
            if (level >= 5) {
                item.classList.add('completed');
            }
        });
    }
    
    useAbility(abilityType) {
        const ability = this.abilities[abilityType];
        
        if (ability.cooldown > 0 || this.gold < ability.cost) {
            return;
        }
        
        this.gold -= ability.cost;
        ability.cooldown = ability.duration;
        
        this.onAbilityUsed();
        
        switch (abilityType) {
            case 'airstrike':
                this.performAirstrike();
                break;
            case 'freeze':
                this.performFreeze();
                break;
            case 'repair':
                this.performRepair();
                break;
        }
        
        this.updateAbilityUI();
    }
    
    performAirstrike() {
        // Урон всем врагам на экране
        this.enemies.forEach(enemy => {
            const damage = 100 + Math.random() * 50;
            enemy.health -= damage;
            this.createDamageNumber(enemy.x, enemy.y, damage, Math.random() < 0.3);
            this.createExplosion(enemy.x, enemy.y, '#f39c12', 25);
        });
        
        this.showEffect('Авиаудар нанесен!', '#e74c3c');
    }
    
    performFreeze() {
        // Замедление всех врагов
        this.enemies.forEach(enemy => {
            enemy.slowEffect = 0.2;
            enemy.slowEndTime = Date.now() + 5000;
        });
        
        this.showEffect('Все враги заморожены!', '#3498db');
    }
    
    performRepair() {
        this.lives = Math.min(this.lives + 5, 20);
        this.showEffect('База отремонтирована! +5 жизней', '#27ae60');
    }
    
    updateAbilityUI() {
        Object.keys(this.abilities).forEach(type => {
            const button = document.getElementById(type + 'Btn');
            const ability = this.abilities[type];
            
            if (ability.cooldown > 0) {
                button.disabled = true;
                const overlay = button.querySelector('.cooldown-overlay');
                overlay.classList.remove('d-none');
                overlay.textContent = Math.ceil(ability.cooldown / 1000) + 's';
            } else {
                button.disabled = this.gold < ability.cost;
                const overlay = button.querySelector('.cooldown-overlay');
                overlay.classList.add('d-none');
            }
        });
    }
    
    createDamageNumber(x, y, damage, critical = false) {
        const damageNumber = document.createElement('div');
        damageNumber.className = 'damage-number' + (critical ? ' critical-hit' : '');
        damageNumber.textContent = Math.floor(damage);
        damageNumber.style.left = x + 'px';
        damageNumber.style.top = y + 'px';
        
        this.canvas.parentElement.appendChild(damageNumber);
        
        setTimeout(() => {
            damageNumber.remove();
        }, 1000);
    }
    
    unlockAchievement(achievementType) {
        if (this.achievements[achievementType]) return;
        
        this.achievements[achievementType] = true;
        
        const achievements = {
            firstKill: 'Первая кровь!',
            wave10: 'Выживший!',
            perfectWave: 'Идеальная защита!',
            economyMaster: 'Экономист!',
            researcher: 'Ученый!',
            survivor: 'Непобедимый!'
        };
        
        this.showAchievement(achievements[achievementType]);
        this.researchPoints += 2;
    }
    
    showAchievement(text) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div><i class="fas fa-trophy me-2"></i><strong>Достижение разблокировано!</strong></div>
            <div>${text}</div>
            <div><small>+2 очка исследований</small></div>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
    
    specializeTower() {
        if (!this.selectedTower || this.selectedTower.specialized) return;
        
        const towerType = this.towerTypes[this.selectedTower.type];
        const specializationCost = towerType.cost * 2;
        
        if (this.gold < specializationCost) return;
        
        this.gold -= specializationCost;
        this.selectedTower.specialized = true;
        
        // Применяем случайную специализацию
        const specializations = towerType.specializations;
        const specialization = specializations[Math.floor(Math.random() * specializations.length)];
        
        this.applySpecialization(this.selectedTower, specialization);
        this.showUpgradePanel(this.selectedTower);
        this.updateUI();
        this.showEffect(`Специализация применена: ${specialization}!`, '#9b59b6');
    }
    
    applySpecialization(tower, specialization) {
        switch (specialization) {
            case 'rapid_fire':
                tower.fireRate *= 0.5;
                tower.specialization = 'Скорострельность';
                break;
            case 'armor_piercing':
                tower.armorPiercing = true;
                tower.specialization = 'Бронебойность';
                break;
            case 'explosive_rounds':
                tower.splashRadius = 30;
                tower.specialization = 'Взрывные снаряды';
                break;
            case 'double_shot':
                tower.multiShot = 2;
                tower.specialization = 'Двойной выстрел';
                break;
            case 'chain_gun':
                tower.chainTargets = 2;
                tower.specialization = 'Цепной огонь';
                break;
            case 'incendiary':
                tower.burnDamage = 10;
                tower.burnDuration = 3000;
                tower.specialization = 'Поджигание';
                break;
            case 'napalm':
                tower.splashRadius *= 1.5;
                tower.burnDamage = 15;
                tower.specialization = 'Напалм';
                break;
            case 'cluster_bomb':
                tower.clusterBombs = 3;
                tower.specialization = 'Кластерные бомбы';
                break;
            case 'absolute_zero':
                tower.freezeChance = 0.5;
                tower.specialization = 'Абсолютный ноль';
                break;
            case 'ice_storm':
                tower.splashRadius = 50;
                tower.specialization = 'Ледяная буря';
                break;
            case 'beam_splitter':
                tower.beamSplit = 3;
                tower.specialization = 'Разделение луча';
                break;
            case 'overcharge':
                tower.overchargeDamage = 2;
                tower.specialization = 'Перегрузка';
                break;
            case 'toxic_cloud':
                tower.gasCloudRadius = 60;
                tower.specialization = 'Ядовитое облако';
                break;
            case 'corrosive_acid':
                tower.armorReduction = 3;
                tower.specialization = 'Коррозийная кислота';
                break;
            case 'storm_caller':
                tower.lightningChance = 0.3;
                tower.specialization = 'Призыватель бури';
                break;
            case 'emp_burst':
                tower.empRadius = 80;
                tower.specialization = 'ЭМИ взрыв';
                break;
        }
    }
    
    startGame() {
        this.gameStarted = true;
        this.gameRunning = true;
        this.startScreen.classList.add('d-none');
        this.resetGame();
        this.initializeQuests();
        this.generateWave();
    }
    
    resetGame() {
        this.gold = 500;
        this.lives = 20;
        this.wave = 1;
        this.enemiesKilled = 0;
        this.totalGoldEarned = 0;
        this.score = 0;
        this.researchPoints = 0;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
        this.damageNumbers = [];
        this.weatherParticles = [];
        this.waveInProgress = false;
        this.selectedTower = null;
        this.upgradePanel.classList.add('d-none');
        this.perfectWaveKills = 0;
        
        // Сброс исследований
        Object.keys(this.research).forEach(key => {
            this.research[key] = 0;
        });
        
        // Сброс способностей
        Object.keys(this.abilities).forEach(key => {
            this.abilities[key].cooldown = 0;
        });
        
        this.updateResearchUI();
        this.updateAbilityUI();
    }
    
    restartGame() {
        this.gameOverScreen.classList.add('d-none');
        this.resetGame();
        this.startGame();
    }
    
    selectTowerType(type) {
        if (this.gold < this.towerTypes[type].cost) {
            this.showEffect('Недостаточно золота!', '#e74c3c');
            return;
        }
        
        document.querySelectorAll('.tower-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        document.querySelector(`[data-tower="${type}"]`).classList.add('selected');
        this.selectedTowerType = type;
        this.placingTower = true;
        this.canvas.style.cursor = 'crosshair';
    }
    
    cancelTowerPlacement() {
        this.selectedTowerType = null;
        this.placingTower = false;
        this.canvas.style.cursor = 'default';
        document.querySelectorAll('.tower-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.placingTower && this.selectedTowerType) {
            this.placeTower(x, y);
        } else {
            this.selectTower(x, y);
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }
    
    placeTower(x, y) {
        if (!this.canPlaceTower(x, y)) {
            this.showEffect('Нельзя разместить здесь!', '#e74c3c');
            return;
        }
        
        const towerType = this.towerTypes[this.selectedTowerType];
        const tower = {
            x: x,
            y: y,
            type: this.selectedTowerType,
            level: 1,
            damage: towerType.damage,
            range: towerType.range,
            fireRate: towerType.fireRate,
            lastShot: 0,
            target: null,
            weatherBonus: 1,
            specialized: false,
            kills: 0,
            totalDamage: 0,
            ...towerType
        };
        
        this.towers.push(tower);
        this.gold -= towerType.cost;
        this.cancelTowerPlacement();
        this.updateUI();
        this.showEffect(`Башня построена! -${towerType.cost} золота`, '#27ae60');
    }
    
    canPlaceTower(x, y) {
        // Проверка на путь
        for (let i = 0; i < this.path.length - 1; i++) {
            const p1 = this.path[i];
            const p2 = this.path[i + 1];
            const distance = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance < 40) return false;
        }
        
        // Проверка на другие башни
        for (const tower of this.towers) {
            if (this.distance(x, y, tower.x, tower.y) < 50) return false;
        }
        
        return true;
    }
    
    selectTower(x, y) {
        this.selectedTower = null;
        for (const tower of this.towers) {
            if (this.distance(x, y, tower.x, tower.y) < 25) {
                this.selectedTower = tower;
                this.showUpgradePanel(tower);
                return;
            }
        }
        this.upgradePanel.classList.add('d-none');
    }
    
    showUpgradePanel(tower) {
        const info = document.getElementById('towerInfo');
        const upgradeCost = Math.floor(tower.upgradeCost * Math.pow(1.5, tower.level - 1));
        const sellValue = Math.floor(tower.sellValue * tower.level * 0.8);
        const specializationCost = this.towerTypes[tower.type].cost * 2;
        
        info.innerHTML = `
            <div class="mb-2"><strong>${tower.name}</strong></div>
            <div>Уровень: ${tower.level}</div>
            <div>Урон: ${Math.floor(tower.damage * (1 + this.research.damage * 0.1))}</div>
            <div>Дальность: ${Math.floor(tower.range * (1 + this.research.range * 0.15))}</div>
            <div>Убийств: ${tower.kills}</div>
            ${tower.specialized ? `<div class="text-info">Специализация: ${tower.specialization}</div>` : ''}
            <div class="mt-2">
                <div>Улучшение: ${upgradeCost} золота</div>
                <div>Продажа: ${sellValue} золота</div>
                ${!tower.specialized ? `<div>Специализация: ${specializationCost} золота</div>` : ''}
            </div>
        `;
        
        this.upgradeTowerButton.disabled = this.gold < upgradeCost;
        this.specializeTowerButton.disabled = tower.specialized || this.gold < specializationCost;
        this.upgradePanel.classList.remove('d-none');
    }
    
    upgradeTower() {
        if (!this.selectedTower) return;
        
        const upgradeCost = Math.floor(this.selectedTower.upgradeCost * Math.pow(1.5, this.selectedTower.level - 1));
        if (this.gold < upgradeCost) return;
        
        this.gold -= upgradeCost;
        this.selectedTower.level++;
        this.selectedTower.damage *= 1.3;
        this.selectedTower.range *= 1.1;
        this.selectedTower.fireRate *= 0.9;
        
        this.onTowerUpgraded();
        this.showUpgradePanel(this.selectedTower);
        this.updateUI();
        this.showEffect(`Башня улучшена! -${upgradeCost} золота`, '#3498db');
    }
    
    sellTower() {
        if (!this.selectedTower) return;
        
        const sellValue = Math.floor(this.selectedTower.sellValue * this.selectedTower.level * 0.8);
        this.gold += sellValue;
        
        this.towers = this.towers.filter(t => t !== this.selectedTower);
        this.selectedTower = null;
        this.upgradePanel.classList.add('d-none');
        this.updateUI();
        this.showEffect(`Башня продана! +${sellValue} золота`, '#f39c12');
    }
    
    generateWave() {
        this.currentWave = [];
        const waveSize = 10 + this.wave * 2;
        this.bossWave = this.wave % 10 === 0;
        
        if (this.bossWave) {
            // Босс волна
            this.currentWave.push('boss');
            for (let i = 0; i < 5; i++) {
                this.currentWave.push('basic');
            }
            this.showBossWarning();
        } else {
            // Обычная волна
            for (let i = 0; i < waveSize; i++) {
                let enemyType;
                const rand = Math.random();
                
                if (this.wave < 3) {
                    enemyType = rand < 0.8 ? 'basic' : 'fast';
                } else if (this.wave < 6) {
                    if (rand < 0.4) enemyType = 'basic';
                    else if (rand < 0.7) enemyType = 'fast';
                    else enemyType = 'tank';
                } else if (this.wave < 10) {
                    if (rand < 0.3) enemyType = 'basic';
                    else if (rand < 0.5) enemyType = 'fast';
                    else if (rand < 0.7) enemyType = 'tank';
                    else if (rand < 0.85) enemyType = 'flying';
                    else enemyType = 'regenerating';
                } else {
                    if (rand < 0.2) enemyType = 'basic';
                    else if (rand < 0.35) enemyType = 'fast';
                    else if (rand < 0.5) enemyType = 'tank';
                    else if (rand < 0.65) enemyType = 'flying';
                    else if (rand < 0.8) enemyType = 'regenerating';
                    else enemyType = 'shielded';
                }
                
                this.currentWave.push(enemyType);
            }
        }
        
        this.updateNextWaveInfo();
    }
    
    showBossWarning() {
        const warning = document.createElement('div');
        warning.className = 'boss-warning';
        warning.innerHTML = `
            <h3><i class="fas fa-skull me-2"></i>ВНИМАНИЕ!</h3>
            <p>Приближается БОСС!</p>
            <p>Волна ${this.wave}</p>
        `;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            warning.remove();
        }, 3000);
    }
    
    updateNextWaveInfo() {
        const info = document.getElementById('nextWaveInfo');
        const counts = {};
        
        this.currentWave.forEach(type => {
            counts[type] = (counts[type] || 0) + 1;
        });
        
        let html = '';
        if (counts.basic) html += `<div><i class="fas fa-user me-2"></i>Обычные: <span class="text-info">${counts.basic}</span></div>`;
        if (counts.fast) html += `<div><i class="fas fa-running me-2"></i>Быстрые: <span class="text-warning">${counts.fast}</span></div>`;
        if (counts.tank) html += `<div><i class="fas fa-shield-alt me-2"></i>Танки: <span class="text-danger">${counts.tank}</span></div>`;
        if (counts.flying) html += `<div><i class="fas fa-plane me-2"></i>Летающие: <span class="text-info">${counts.flying}</span></div>`;
        if (counts.regenerating) html += `<div><i class="fas fa-heart me-2"></i>Регенерирующие: <span class="text-success">${counts.regenerating}</span></div>`;
        if (counts.shielded) html += `<div><i class="fas fa-shield me-2"></i>Щитовые: <span class="text-primary">${counts.shielded}</span></div>`;
        if (counts.boss) html += `<div><i class="fas fa-skull me-2"></i>БОСС: <span class="text-danger">${counts.boss}</span></div>`;
        
        info.innerHTML = html;
    }
    
    startWave() {
        if (this.waveInProgress) return;
        
        this.waveInProgress = true;
        this.enemiesSpawned = 0;
        this.lastEnemySpawn = Date.now();
        this.perfectWaveKills = 0;
        this.startWaveButton.disabled = true;
        this.startWaveButton.innerHTML = '<i class="fas fa-clock me-2"></i>Волна идет...';
    }
    
    spawnEnemy() {
        if (this.enemiesSpawned >= this.currentWave.length) return;
        
        const now = Date.now();
        if (now - this.lastEnemySpawn < this.timeBetweenEnemies) return;
        
        const enemyType = this.currentWave[this.enemiesSpawned];
        const enemyData = this.enemyTypes[enemyType];
        
        const enemy = {
            x: this.path[0].x,
            y: this.path[0].y,
            type: enemyType,
            health: enemyData.health * (1 + this.wave * 0.2),
            maxHealth: enemyData.health * (1 + this.wave * 0.2),
            speed: enemyData.speed,
            reward: enemyData.reward * (1 + Math.floor(this.wave / 5)),
            color: enemyData.color,
            size: enemyData.size,
            pathIndex: 0,
            pathProgress: 0,
            slowEffect: 1,
            slowEndTime: 0,
            flying: enemyData.flying || false,
            armor: enemyData.armor || 0,
            shield: enemyData.shield || 0,
            maxShield: enemyData.shield || 0,
            resistances: enemyData.resistances || {},
            statusEffects: {},
            ...enemyData
        };
        
        this.enemies.push(enemy);
        this.enemiesSpawned++;
        this.lastEnemySpawn = now;
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.update();
            this.draw();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.waveInProgress) {
            this.spawnEnemy();
        }
        
        this.updateEnemies();
        this.updateTowers();
        this.updateProjectiles();
        this.updateEffects();
        this.updateWeather();
        this.updateAbilities();
        this.updateEconomicSystems();
        this.updateTimeEffects();
        this.updatePortals();
        this.updateShields();
        this.updateGameTimer();
        this.generateDailyQuests(); // Проверяем ежедневные квесты
        this.checkWaveComplete();
        this.updateDifficulty();
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    updateWeather() {
        if (this.weatherDuration > 0) {
            this.weatherDuration -= 16;
            
            if (this.weatherEffect === 'rain') {
                this.weatherParticles.forEach(particle => {
                    particle.y += particle.speed;
                });
                
                this.weatherParticles = this.weatherParticles.filter(p => p.y < this.canvas.height);
                
                if (this.weatherParticles.length < 30) {
                    this.createWeatherEffects();
                }
            }
        } else if (this.weatherEffect) {
            this.weatherEffect = null;
            this.weatherParticles = [];
            this.towers.forEach(tower => {
                tower.weatherBonus = 1;
            });
        }
    }
    
    updateAbilities() {
        Object.keys(this.abilities).forEach(type => {
            if (this.abilities[type].cooldown > 0) {
                this.abilities[type].cooldown -= 16;
                if (this.abilities[type].cooldown < 0) {
                    this.abilities[type].cooldown = 0;
                }
            }
        });
        
        this.updateAbilityUI();
    }
    
    updateDifficulty() {
        if (this.wave <= 5) {
            this.difficulty = 'Легко';
        } else if (this.wave <= 15) {
            this.difficulty = 'Средне';
        } else if (this.wave <= 30) {
            this.difficulty = 'Сложно';
        } else {
            this.difficulty = 'Кошмар';
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Обновление эффектов
            this.updateEnemyEffects(enemy);
            
            // Движение по пути
            if (enemy.pathIndex < this.path.length - 1) {
                const currentPoint = this.path[enemy.pathIndex];
                const nextPoint = this.path[enemy.pathIndex + 1];
                
                const dx = nextPoint.x - currentPoint.x;
                const dy = nextPoint.y - currentPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const moveDistance = enemy.speed * enemy.slowEffect;
                enemy.pathProgress += moveDistance / distance;
                
                if (enemy.pathProgress >= 1) {
                    enemy.pathIndex++;
                    enemy.pathProgress = 0;
                } else {
                    enemy.x = currentPoint.x + dx * enemy.pathProgress;
                    enemy.y = currentPoint.y + dy * enemy.pathProgress;
                }
            } else {
                // Враг дошел до конца
                const damage = enemy.isBoss ? 5 : 1;
                this.lives -= damage;
                this.enemies.splice(i, 1);
                this.showEffect(`-${damage} жизн${damage > 1 ? 'и' : 'ь'}!`, '#e74c3c');
            }
            
            // Удаление мертвых врагов
            if (enemy.health <= 0) {
                this.gold += enemy.reward * (1 + this.research.economy * 0.25);
                this.totalGoldEarned += enemy.reward;
                this.enemiesKilled++;
                this.perfectWaveKills++;
                this.score += enemy.reward * 10;
                this.researchPoints += enemy.isBoss ? 5 : 1;
                
                // Увеличиваем счетчик убийств для башни
                this.towers.forEach(tower => {
                    if (tower.target === enemy) {
                        tower.kills++;
                    }
                });
                
                this.enemies.splice(i, 1);
                this.createExplosion(enemy.x, enemy.y, enemy.color);
                this.showEffect(`+${enemy.reward} золота`, '#f39c12');
                
                if (this.enemiesKilled === 1) {
                    this.unlockAchievement('firstKill');
                }
            }
        }
    }
    
    updateEnemyEffects(enemy) {
        // Обновление замедления
        if (Date.now() > enemy.slowEndTime) {
            enemy.slowEffect = 1;
        }
        
        // Регенерация
        if (enemy.regeneration && enemy.health < enemy.maxHealth) {
            enemy.health = Math.min(enemy.health + enemy.regeneration, enemy.maxHealth);
        }
        
        // Регенерация щита
        if (enemy.shieldRegen && enemy.shield < enemy.maxShield) {
            enemy.shield = Math.min(enemy.shield + enemy.shieldRegen, enemy.maxShield);
        }
        
        // Обновление статусных эффектов
        Object.keys(enemy.statusEffects).forEach(effect => {
            const statusEffect = enemy.statusEffects[effect];
            statusEffect.duration -= 16;
            
            if (effect === 'burn') {
                enemy.health -= statusEffect.damage;
                if (Math.random() < 0.1) {
                    this.createDamageNumber(enemy.x, enemy.y, statusEffect.damage);
                }
            } else if (effect === 'poison') {
                enemy.health -= statusEffect.damage;
                if (Math.random() < 0.1) {
                    this.createDamageNumber(enemy.x, enemy.y, statusEffect.damage);
                }
            }
            
            if (statusEffect.duration <= 0) {
                delete enemy.statusEffects[effect];
            }
        });
    }
    
    updateTowers() {
        const now = Date.now();
        
        for (const tower of this.towers) {
            // Поиск цели
            tower.target = null;
            let closestDistance = tower.range * (1 + this.research.range * 0.15);
            
            for (const enemy of this.enemies) {
                const distance = this.distance(tower.x, tower.y, enemy.x, enemy.y);
                if (distance <= closestDistance) {
                    // Проверка на летающих врагов для наземных башен
                    if (!enemy.flying || tower.type === 'sniper' || tower.type === 'laser' || tower.type === 'tesla') {
                        tower.target = enemy;
                        closestDistance = distance;
                    }
                }
            }
            
            // Стрельба
            const adjustedFireRate = tower.fireRate * (1 - this.research.speed * 0.2);
            if (tower.target && now - tower.lastShot >= adjustedFireRate) {
                this.createProjectile(tower, tower.target);
                tower.lastShot = now;
            }
            
            // Обновление перегрева для лазерных башен
            if (tower.overheat) {
                if (tower.target && tower.heatLevel < tower.overheatThreshold) {
                    tower.heatLevel = (tower.heatLevel || 0) + 1;
                } else if (!tower.target && tower.heatLevel > 0) {
                    tower.heatLevel = Math.max(0, tower.heatLevel - tower.cooldownRate);
                }
            }
        }
    }
    
    createProjectile(tower, target) {
        const baseDamage = tower.damage * (1 + this.research.damage * 0.1) * (tower.weatherBonus || 1);
        const isCritical = Math.random() < tower.critChance;
        const finalDamage = isCritical ? baseDamage * 2 : baseDamage;
        
        const projectile = {
            x: tower.x,
            y: tower.y,
            targetX: target.x,
            targetY: target.y,
            target: target,
            damage: finalDamage,
            speed: tower.projectileSpeed,
            color: tower.color,
            type: tower.type,
            critical: isCritical,
            tower: tower,
            ...tower
        };
        
        // Мультивыстрел
        if (tower.multiShot) {
            for (let i = 0; i < tower.multiShot; i++) {
                const spreadAngle = (i - (tower.multiShot - 1) / 2) * 0.2;
                const spreadProjectile = { ...projectile };
                spreadProjectile.targetX += Math.sin(spreadAngle) * 20;
                spreadProjectile.targetY += Math.cos(spreadAngle) * 20;
                this.projectiles.push(spreadProjectile);
            }
        } else {
            this.projectiles.push(projectile);
        }
    }
    
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            const dx = projectile.targetX - projectile.x;
            const dy = projectile.targetY - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < projectile.speed) {
                // Попадание
                this.handleProjectileHit(projectile);
                this.projectiles.splice(i, 1);
            } else {
                // Движение снаряда
                projectile.x += (dx / distance) * projectile.speed;
                projectile.y += (dy / distance) * projectile.speed;
            }
        }
    }
    
    handleProjectileHit(projectile) {
        if (projectile.type === 'splash') {
            // Взрывной урон
            for (const enemy of this.enemies) {
                const distance = this.distance(projectile.targetX, projectile.targetY, enemy.x, enemy.y);
                if (distance <= projectile.splashRadius) {
                    const damage = projectile.damage * (1 - distance / projectile.splashRadius);
                    this.damageEnemy(enemy, damage, projectile);
                }
            }
            this.createExplosion(projectile.targetX, projectile.targetY, '#f39c12', projectile.splashRadius);
        } else if (projectile.type === 'laser' && projectile.continuous) {
            // Непрерывный лазер
            if (projectile.target && projectile.target.health > 0) {
                this.damageEnemy(projectile.target, projectile.damage / 10, projectile);
            }
        } else {
            // Обычный урон
            if (projectile.target && projectile.target.health > 0) {
                this.damageEnemy(projectile.target, projectile.damage, projectile);
                
                // Цепная молния
                if (projectile.chainLightning && projectile.chainTargets > 0) {
                    this.createChainLightning(projectile.target, projectile.damage * 0.7, projectile.chainTargets - 1);
                }
                
                // Пробивание
                if (projectile.piercing) {
                    // Ищем следующую цель за текущей
                    const nextTarget = this.findNextPiercingTarget(projectile.target, projectile);
                    if (nextTarget) {
                        this.damageEnemy(nextTarget, projectile.damage * 0.8, projectile);
                    }
                }
            }
        }
    }
    
    damageEnemy(enemy, damage, projectile) {
        // Проверка на уклонение
        if (enemy.dodge && Math.random() < enemy.dodge) {
            this.createDamageNumber(enemy.x, enemy.y - 10, 'MISS');
            return;
        }
        
        // Применение брони
        let finalDamage = Math.max(1, damage - enemy.armor);
        
        // Применение сопротивлений
        if (enemy.resistances[projectile.type]) {
            finalDamage *= (1 - enemy.resistances[projectile.type]);
        }
        
        // Урон по щиту сначала
        if (enemy.shield > 0) {
            const shieldDamage = Math.min(enemy.shield, finalDamage);
            enemy.shield -= shieldDamage;
            finalDamage -= shieldDamage;
        }
        
        // Урон по здоровью
        enemy.health -= finalDamage;
        
        // Создание числа урона
        this.createDamageNumber(enemy.x, enemy.y, Math.floor(finalDamage), projectile.critical);
        
        // Применение статусных эффектов
        if (projectile.burnDamage) {
            enemy.statusEffects.burn = {
                damage: projectile.burnDamage,
                duration: projectile.burnDuration || 3000
            };
        }
        
        if (projectile.poisonDamage) {
            enemy.statusEffects.poison = {
                damage: projectile.poisonDamage,
                duration: projectile.poisonDuration || 3000
            };
        }
        
        if (projectile.slowEffect) {
            enemy.slowEffect = projectile.slowEffect;
            enemy.slowEndTime = Date.now() + (projectile.slowDuration || 2000);
        }
        
        if (projectile.freezeChance && Math.random() < projectile.freezeChance) {
            enemy.slowEffect = 0.1;
            enemy.slowEndTime = Date.now() + 2000;
        }
        
        if (projectile.stunChance && Math.random() < projectile.stunChance) {
            enemy.slowEffect = 0;
            enemy.slowEndTime = Date.now() + (projectile.stunDuration || 1000);
        }
    }
    
    createChainLightning(startEnemy, damage, remainingTargets) {
        if (remainingTargets <= 0) return;
        
        let closestEnemy = null;
        let closestDistance = 100;
        
        for (const enemy of this.enemies) {
            if (enemy === startEnemy) continue;
            
            const distance = this.distance(startEnemy.x, startEnemy.y, enemy.x, enemy.y);
            if (distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        }
        
        if (closestEnemy) {
            this.damageEnemy(closestEnemy, damage, { type: 'tesla', critical: false });
            this.createChainLightning(closestEnemy, damage * 0.8, remainingTargets - 1);
            
            // Визуальный эффект молнии
            this.effects.push({
                type: 'lightning',
                x1: startEnemy.x,
                y1: startEnemy.y,
                x2: closestEnemy.x,
                y2: closestEnemy.y,
                life: 10,
                opacity: 1
            });
        }
    }
    
    findNextPiercingTarget(currentTarget, projectile) {
        const angle = Math.atan2(projectile.targetY - projectile.y, projectile.targetX - projectile.x);
        
        for (const enemy of this.enemies) {
            if (enemy === currentTarget) continue;
            
            const enemyAngle = Math.atan2(enemy.y - currentTarget.y, enemy.x - currentTarget.x);
            const angleDiff = Math.abs(angle - enemyAngle);
            
            if (angleDiff < 0.5 && this.distance(currentTarget.x, currentTarget.y, enemy.x, enemy.y) < 50) {
                return enemy;
            }
        }
        
        return null;
    }
    
    updateEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life--;
            effect.opacity -= 0.05;
            
            if (effect.type === 'text') {
                effect.y -= 1;
            }
            
            if (effect.life <= 0 || effect.opacity <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }
    
    checkWaveComplete() {
        if (this.waveInProgress && this.enemiesSpawned >= this.currentWave.length && this.enemies.length === 0) {
            this.waveInProgress = false;
            
            // Проверка на идеальную волну
            if (this.perfectWaveKills === this.currentWave.length && this.lives === 20) {
                this.unlockAchievement('perfectWave');
            }
            
            // Бонус за волну
            const waveBonus = 50 + this.wave * 10;
            this.gold += waveBonus * (1 + this.research.economy * 0.25);
            this.totalGoldEarned += waveBonus;
            this.score += waveBonus * 5;
            
            // Квестовые события
            const perfectWave = this.perfectWaveKills === this.currentWave.length && this.lives === 20;
            this.onWaveCompleted(this.wave, perfectWave);
            this.onGoldEarned(waveBonus);
            
            // Проверка достижений
            if (this.wave === 10) {
                this.unlockAchievement('wave10');
            }
            
            if (this.gold >= 2000) {
                this.unlockAchievement('economyMaster');
            }
            
            if (this.wave >= 50) {
                this.unlockAchievement('survivor');
            }
            
            this.wave++;
            this.generateWave();
            this.startWaveButton.disabled = false;
            this.startWaveButton.innerHTML = '<i class="fas fa-play me-2"></i>Начать волну';
            this.showEffect(`Волна завершена! +${waveBonus} золота`, '#27ae60');
        }
    }
    
    createExplosion(x, y, color, size = 30) {
        for (let i = 0; i < 15; i++) {
            this.effects.push({
                x: x + (Math.random() - 0.5) * size,
                y: y + (Math.random() - 0.5) * size,
                life: 30 + Math.random() * 20,
                opacity: 1,
                color: color,
                size: Math.random() * 8 + 3,
                type: 'explosion',
                velocity: {
                    x: (Math.random() - 0.5) * 4,
                    y: (Math.random() - 0.5) * 4
                }
            });
        }
    }
    
    showEffect(text, color) {
        this.effects.push({
            x: this.canvas.width / 2,
            y: 100,
            text: text,
            color: color,
            life: 120,
            opacity: 1,
            type: 'text'
        });
    }
    
    draw() {
        // Очистка
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Погодные эффекты
        this.drawWeatherEffects();
        
        // Множественные пути
        this.drawMultiplePaths();
        
        // Ресурсные узлы
        this.drawResourceNodes();
        
        // Порталы
        this.drawPortals();
        
        // Щиты
        this.drawShields();
        
        // Башни
        this.towers.forEach(tower => this.drawTower(tower));
        
        // Враги
        this.enemies.forEach(enemy => {
            this.drawAdvancedEnemyEffects(enemy);
            this.drawEnemy(enemy);
            this.ctx.globalAlpha = 1; // Сброс прозрачности после стелс эффекта
        });
        
        // Снаряды
        this.projectiles.forEach(projectile => this.drawProjectile(projectile));
        
        // Эффекты
        this.effects.forEach(effect => this.drawEffect(effect));
        
        // Временные искажения
        if (this.timeEffects.timeWarp.active) {
            this.drawTimeDistortion();
        }
        
        // Предпросмотр размещения башни
        if (this.placingTower && this.mouseX && this.mouseY) {
            this.drawTowerPreview();
        }
        
        // Выделение выбранной башни
        if (this.selectedTower) {
            this.drawTowerSelection(this.selectedTower);
        }
    }
    
    drawWeatherEffects() {
        if (this.weatherEffect === 'rain') {
            this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.6)';
            this.ctx.lineWidth = 1;
            
            this.weatherParticles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(particle.x - 2, particle.y + 8);
                this.ctx.stroke();
            });
        }
    }
    
    drawPath() {
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 30;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
        
        // Направляющие стрелки
        for (let i = 0; i < this.path.length - 1; i++) {
            const p1 = this.path[i];
            const p2 = this.path[i + 1];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            
            this.ctx.fillStyle = '#654321';
            this.ctx.save();
            this.ctx.translate(midX, midY);
            this.ctx.rotate(Math.atan2(p2.y - p1.y, p2.x - p1.x));
            this.ctx.beginPath();
            this.ctx.moveTo(-10, -5);
            this.ctx.lineTo(10, 0);
            this.ctx.lineTo(-10, 5);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    drawTower(tower) {
        // База башни
        this.ctx.fillStyle = '#34495e';
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, 22, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Основная часть
        this.ctx.fillStyle = tower.color;
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Специализация индикатор
        if (tower.specialized) {
            this.ctx.strokeStyle = '#f39c12';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(tower.x, tower.y, 20, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Уровень башни
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(tower.level, tower.x, tower.y + 4);
        
        // Дуло (направлено на цель)
        if (tower.target) {
            const angle = Math.atan2(tower.target.y - tower.y, tower.target.x - tower.x);
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(tower.x, tower.y);
            this.ctx.lineTo(tower.x + Math.cos(angle) * 28, tower.y + Math.sin(angle) * 28);
            this.ctx.stroke();
        }
        
        // Индикатор перегрева для лазерных башен
        if (tower.overheat && tower.heatLevel > 0) {
            const heatPercent = tower.heatLevel / tower.overheatThreshold;
            this.ctx.fillStyle = `rgba(255, ${255 - heatPercent * 255}, 0, 0.7)`;
            this.ctx.beginPath();
            this.ctx.arc(tower.x, tower.y, 25, 0, Math.PI * 2 * heatPercent);
            this.ctx.fill();
        }
    }
    
    drawEnemy(enemy) {
        // Тень
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.arc(enemy.x + 2, enemy.y + 2, enemy.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Основное тело
        this.ctx.fillStyle = enemy.color;
        this.ctx.beginPath();
        this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Броня индикатор
        if (enemy.armor > 0) {
            this.ctx.strokeStyle = '#95a5a6';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size + 2, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Полоска здоровья
        const healthPercent = enemy.health / enemy.maxHealth;
        const barWidth = enemy.size * 2.5;
        const barHeight = 4;
        
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 12, barWidth, barHeight);
        
        this.ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        this.ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 12, barWidth * healthPercent, barHeight);
        
        // Полоска щита
        if (enemy.maxShield > 0) {
            const shieldPercent = enemy.shield / enemy.maxShield;
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 18, barWidth, 3);
            
            this.ctx.fillStyle = '#3498db';
            this.ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 18, barWidth * shieldPercent, 3);
        }
        
        // Статусные эффекты
        let effectOffset = 0;
        Object.keys(enemy.statusEffects).forEach(effect => {
            let color = '#ffffff';
            if (effect === 'burn') color = '#e74c3c';
            if (effect === 'poison') color = '#27ae60';
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x + enemy.size + 5 + effectOffset, enemy.y - enemy.size, 3, 0, Math.PI * 2);
            this.ctx.fill();
            effectOffset += 8;
        });
        
        // Эффект замедления
        if (enemy.slowEffect < 1) {
            this.ctx.strokeStyle = '#3498db';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Индикатор летающего врага
        if (enemy.flying) {
            this.ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size + 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Индикатор босса
        if (enemy.isBoss) {
            this.ctx.strokeStyle = '#8e44ad';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size + 8, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Корона босса
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.beginPath();
            this.ctx.moveTo(enemy.x - 8, enemy.y - enemy.size - 5);
            this.ctx.lineTo(enemy.x - 4, enemy.y - enemy.size - 12);
            this.ctx.lineTo(enemy.x, enemy.y - enemy.size - 8);
            this.ctx.lineTo(enemy.x + 4, enemy.y - enemy.size - 12);
            this.ctx.lineTo(enemy.x + 8, enemy.y - enemy.size - 5);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    drawProjectile(projectile) {
        this.ctx.fillStyle = projectile.critical ? '#f1c40f' : projectile.color;
        this.ctx.beginPath();
        this.ctx.arc(projectile.x, projectile.y, projectile.critical ? 5 : 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Критический эффект
        if (projectile.critical) {
            this.ctx.strokeStyle = '#f39c12';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, 7, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // След снаряда
        this.ctx.strokeStyle = projectile.color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.5;
        this.ctx.beginPath();
        const dx = projectile.targetX - projectile.x;
        const dy = projectile.targetY - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const trailLength = 15;
        this.ctx.moveTo(projectile.x, projectile.y);
        this.ctx.lineTo(projectile.x - (dx / distance) * trailLength, projectile.y - (dy / distance) * trailLength);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }
    
    drawEffect(effect) {
        this.ctx.globalAlpha = effect.opacity;
        
        if (effect.type === 'text') {
            this.ctx.fillStyle = effect.color;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(effect.text, effect.x, effect.y);
        } else if (effect.type === 'explosion') {
            this.ctx.fillStyle = effect.color;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (effect.velocity) {
                effect.x += effect.velocity.x;
                effect.y += effect.velocity.y;
                effect.velocity.y += 0.1; // Гравитация
            }
        } else if (effect.type === 'lightning') {
            this.ctx.strokeStyle = '#f1c40f';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(effect.x1, effect.y1);
            this.ctx.lineTo(effect.x2, effect.y2);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    drawTowerPreview() {
        const tower = this.towerTypes[this.selectedTowerType];
        const canPlace = this.canPlaceTower(this.mouseX, this.mouseY);
        
        // Радиус действия
        this.ctx.strokeStyle = canPlace ? 'rgba(52, 152, 219, 0.3)' : 'rgba(231, 76, 60, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, tower.range * (1 + this.research.range * 0.15), 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Предпросмотр башни
        this.ctx.fillStyle = canPlace ? tower.color : '#e74c3c';
        this.ctx.globalAlpha = 0.7;
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, 18, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    
    drawTowerSelection(tower) {
        // Радиус действия
        this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, tower.range * (1 + this.research.range * 0.15), 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Выделение башни
        this.ctx.strokeStyle = '#f39c12';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, 25, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    updateUI() {
        this.goldElement.textContent = this.gold;
        this.livesElement.textContent = this.lives;
        this.waveElement.textContent = this.wave;
        this.killedElement.textContent = this.enemiesKilled;
        this.scoreElement.textContent = this.score;
        this.difficultyElement.textContent = this.difficulty;
        this.researchPointsElement.textContent = this.researchPoints;
        this.energyElement.textContent = `${this.energy}/${this.maxEnergy}`;
        this.productionElement.textContent = `+${this.production}/сек`;
        this.crystalsElement.textContent = this.crystals;
        this.planetElement.textContent = this.currentPlanet === 'earth' ? 'Земля' : 
                                        this.currentPlanet === 'mars' ? 'Марс' : 'Луна';
        
        // Обновляем информацию об опыте и уровне
        if (this.experienceElement) {
            this.experienceElement.textContent = `${this.experience}/${this.experienceToNext}`;
        }
        if (this.playerLevelElement) {
            this.playerLevelElement.textContent = this.playerLevel;
        }
        
        // Прогресс волны
        if (this.waveInProgress) {
            const progress = (this.enemiesSpawned / this.currentWave.length) * 100;
            this.waveProgressElement.style.width = progress + '%';
        } else {
            this.waveProgressElement.style.width = '0%';
        }
        
        // Обновление доступности башен
        document.querySelectorAll('.tower-item').forEach(item => {
            const towerType = item.dataset.tower;
            const towerData = this.towerTypes[towerType];
            const cost = towerData.cost;
            const energyCost = towerData.energyCost || 0;
            
            if (this.gold < cost || this.energy < energyCost) {
                item.classList.add('disabled');
            } else {
                item.classList.remove('disabled');
            }
        });
        
        this.updateBuildingUI();
        this.updateCraftingUI();
    }
    
    gameOver() {
        this.gameRunning = false;
        
        document.getElementById('finalWave').textContent = this.wave;
        document.getElementById('finalKilled').textContent = this.enemiesKilled;
        document.getElementById('finalGold').textContent = this.totalGoldEarned;
        
        this.gameOverScreen.classList.remove('d-none');
    }
    
    // Утилиты
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    distanceToLineSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
    new TowerDefense();
});
    
    purchaseBuilding(type) {
        const costs = { generator: 100, mine: 200, factory: 300 };
        const cost = costs[type];
        
        if (this.gold >= cost) {
            this.gold -= cost;
            this.buildings[type + 's']++;
            
            switch (type) {
                case 'generator':
                    this.maxEnergy += 20;
                    this.energy = Math.min(this.energy + 20, this.maxEnergy);
                    this.production += 2;
                    break;
                case 'mine':
                    this.production += 3;
                    break;
                case 'factory':
                    this.production += 10;
                    break;
            }
            
            this.updateBuildingUI();
            this.showEffect(`${type} построен! +${this.production} производства`, '#e67e22');
        }
    }
    
    updateBuildingUI() {
        document.querySelectorAll('.building-item').forEach(item => {
            const type = item.dataset.building;
            const costs = { generator: 100, mine: 200, factory: 300 };
            const cost = costs[type];
            
            if (this.gold >= cost) {
                item.classList.remove('disabled');
            } else {
                item.classList.add('disabled');
            }
        });
    }
    
    craftItem(type) {
        const recipes = {
            superweapon: { crystals: 10, gold: 1000 },
            timewarp: { crystals: 5, gold: 500 },
            fortress: { crystals: 15, gold: 2000 }
        };
        
        const recipe = recipes[type];
        if (this.crystals >= recipe.crystals && this.gold >= recipe.gold) {
            this.crystals -= recipe.crystals;
            this.gold -= recipe.gold;
            
            switch (type) {
                case 'superweapon':
                    this.activateSuperweapon();
                    break;
                case 'timewarp':
                    this.activateTimeWarp();
                    break;
                case 'fortress':
                    this.buildFortress();
                    break;
            }
            
            this.updateCraftingUI();
        }
    }
    
    activateSuperweapon() {
        // Уничтожает всех врагов на экране
        this.enemies.forEach(enemy => {
            this.gold += enemy.reward;
            this.enemiesKilled++;
            this.score += enemy.reward * 20;
            this.createExplosion(enemy.x, enemy.y, '#f1c40f', 50);
        });
        
        this.enemies = [];
        this.showEffect('СУПЕРОРУЖИЕ АКТИВИРОВАНО!', '#f1c40f');
        
        // Визуальный эффект
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                this.createExplosion(x, y, '#f1c40f', 30);
            }, i * 100);
        }
    }
    
    activateTimeWarp() {
        this.timeEffects.timeWarp.active = true;
        this.timeEffects.timeWarp.duration = 10000;
        this.timeEffects.timeWarp.strength = 0.3;
        
        this.showEffect('ИСКАЖЕНИЕ ВРЕМЕНИ АКТИВИРОВАНО!', '#9b59b6');
    }
    
    buildFortress() {
        // Создает неразрушимую защитную структуру
        const fortress = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            type: 'fortress',
            health: 99999,
            maxHealth: 99999,
            size: 50,
            color: '#34495e',
            indestructible: true
        };
        
        this.towers.push(fortress);
        this.showEffect('КРЕПОСТЬ ПОСТРОЕНА!', '#34495e');
    }
    
    updateCraftingUI() {
        document.querySelectorAll('.craft-item').forEach(item => {
            const type = item.dataset.craft;
            const recipes = {
                superweapon: { crystals: 10, gold: 1000 },
                timewarp: { crystals: 5, gold: 500 },
                fortress: { crystals: 15, gold: 2000 }
            };
            
            const recipe = recipes[type];
            if (this.crystals >= recipe.crystals && this.gold >= recipe.gold) {
                item.classList.add('available');
            } else {
                item.classList.remove('available');
            }
        });
    }
    
    handleResourceClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        for (const node of this.resourceNodes) {
            if (this.distance(x, y, node.x, node.y) < 20) {
                this.harvestResource(node);
                break;
            }
        }
    }
    
    harvestResource(node) {
        const now = Date.now();
        if (now - node.lastHarvest < node.respawnTime) return;
        
        node.lastHarvest = now;
        
        switch (node.type) {
            case 'gold':
                this.gold += node.amount;
                this.showEffect(`+${node.amount} золота`, '#f1c40f');
                break;
            case 'crystal':
                this.crystals += node.amount;
                this.showEffect(`+${node.amount} кристалл`, '#9b59b6');
                break;
            case 'energy':
                this.energy = Math.min(this.energy + node.amount, this.maxEnergy);
                this.showEffect(`+${node.amount} энергии`, '#3498db');
                break;
        }
    }
    
    updateEconomicSystems() {
        // Производство золота
        if (this.gameTime % 60 === 0) { // Каждую секунду
            this.gold += this.production;
        }
        
        // Производство кристаллов от шахт
        if (this.gameTime % 600 === 0 && this.buildings.mines > 0) { // Каждые 10 секунд
            this.crystals += this.buildings.mines;
            this.showEffect(`+${this.buildings.mines} кристаллов от шахт`, '#9b59b6');
        }
        
        // Регенерация энергии
        if (this.gameTime % 30 === 0) { // Каждые 0.5 секунды
            this.energy = Math.min(this.energy + 1, this.maxEnergy);
        }
        
        // Обновление дипломатии
        this.updateDiplomacy();
    }
    
    updateDiplomacy() {
        // Альянс - улучшается при защите базы
        if (this.lives === 20) {
            this.factions.alliance.reputation = Math.min(100, this.factions.alliance.reputation + 0.1);
        }
        
        // Пираты - ухудшается при убийстве врагов
        if (this.enemiesKilled > 0) {
            this.factions.pirates.reputation = Math.max(0, this.factions.pirates.reputation - 0.05);
        }
        
        // Торговцы - улучшается при накоплении золота
        if (this.gold > 1000) {
            this.factions.traders.reputation = Math.min(100, this.factions.traders.reputation + 0.02);
        }
        
        // Обновление статусов
        Object.keys(this.factions).forEach(faction => {
            const rep = this.factions[faction].reputation;
            const oldStatus = this.factions[faction].status;
            let newStatus;
            
            if (rep < 30) newStatus = 'hostile';
            else if (rep < 70) newStatus = 'neutral';
            else newStatus = 'friendly';
            
            this.factions[faction].status = newStatus;
            
            // Проверяем изменение статуса для квестов
            if (oldStatus !== newStatus) {
                this.onDiplomacyChanged(faction, newStatus);
            }
        });
        
        this.updateDiplomacyUI();
    }
    
    updateDiplomacyUI() {
        Object.keys(this.factions).forEach(faction => {
            const rep = this.factions[faction].reputation;
            const status = this.factions[faction].status;
            
            const repElement = document.getElementById(faction + 'Rep');
            const barElement = document.getElementById(faction + 'Bar');
            
            if (repElement && barElement) {
                repElement.textContent = status === 'hostile' ? 'Враждебно' : 
                                       status === 'neutral' ? 'Нейтрально' : 'Дружелюбно';
                repElement.className = status === 'hostile' ? 'text-danger' : 
                                     status === 'neutral' ? 'text-warning' : 'text-success';
                barElement.style.width = rep + '%';
            }
        });
    }
    
    updateTimeEffects() {
        Object.keys(this.timeEffects).forEach(effect => {
            if (this.timeEffects[effect].active) {
                this.timeEffects[effect].duration -= 16;
                if (this.timeEffects[effect].duration <= 0) {
                    this.timeEffects[effect].active = false;
                    this.timeEffects[effect].strength = 1;
                }
            }
        });
    }
    
    spawnEnemyOnPath(enemyType, pathIndex = 0) {
        const enemyData = this.enemyTypes[enemyType];
        const path = this.paths[pathIndex];
        
        const enemy = {
            x: path[0].x,
            y: path[0].y,
            type: enemyType,
            health: enemyData.health * (1 + this.wave * 0.2),
            maxHealth: enemyData.health * (1 + this.wave * 0.2),
            speed: enemyData.speed,
            reward: enemyData.reward * (1 + Math.floor(this.wave / 5)),
            color: enemyData.color,
            size: enemyData.size,
            pathIndex: 0,
            pathProgress: 0,
            currentPath: pathIndex,
            path: path,
            slowEffect: 1,
            slowEndTime: 0,
            flying: enemyData.flying || false,
            armor: enemyData.armor || 0,
            shield: enemyData.shield || 0,
            maxShield: enemyData.shield || 0,
            resistances: enemyData.resistances || {},
            statusEffects: {},
            ...enemyData
        };
        
        // Специальные способности врагов
        if (enemy.swarm) {
            // Создаем рой
            for (let i = 0; i < enemy.spawnCount; i++) {
                const swarmEnemy = { ...enemy };
                swarmEnemy.x += (Math.random() - 0.5) * 50;
                swarmEnemy.y += (Math.random() - 0.5) * 50;
                this.enemies.push(swarmEnemy);
            }
        } else {
            this.enemies.push(enemy);
        }
    }
    
    updateAdvancedEnemyBehavior(enemy) {
        // Стелс
        if (enemy.stealth && !enemy.stealthActive) {
            if (Math.random() < 0.01) { // 1% шанс каждый кадр
                enemy.stealthActive = true;
                enemy.stealthEndTime = Date.now() + enemy.stealthDuration;
            }
        }
        
        if (enemy.stealthActive && Date.now() > enemy.stealthEndTime) {
            enemy.stealthActive = false;
        }
        
        // Берсерк
        if (enemy.rage && !enemy.rageActive) {
            if (enemy.health / enemy.maxHealth < enemy.rageThreshold) {
                enemy.rageActive = true;
                enemy.speed *= 2;
                enemy.color = '#e74c3c';
            }
        }
        
        // Телепортация
        if (enemy.teleport && Math.random() < enemy.teleportChance / 1000) {
            const angle = Math.random() * Math.PI * 2;
            enemy.x += Math.cos(angle) * enemy.teleportRange;
            enemy.y += Math.sin(angle) * enemy.teleportRange;
            
            // Ограничиваем телепортацию границами экрана
            enemy.x = Math.max(0, Math.min(this.canvas.width, enemy.x));
            enemy.y = Math.max(0, Math.min(this.canvas.height, enemy.y));
            
            this.createQuantumEffect(enemy.x, enemy.y);
        }
        
        // Фазовый сдвиг
        if (enemy.phaseShift && Math.random() < enemy.phaseChance / 1000) {
            enemy.phaseActive = true;
            enemy.phaseEndTime = Date.now() + 2000;
        }
        
        if (enemy.phaseActive && Date.now() > enemy.phaseEndTime) {
            enemy.phaseActive = false;
        }
        
        // Адаптация киберврагов
        if (enemy.adaptation) {
            // Анализируем последние атаки и увеличиваем сопротивление
            const recentDamageTypes = enemy.recentDamage || [];
            recentDamageTypes.forEach(damageType => {
                if (!enemy.resistances[damageType]) {
                    enemy.resistances[damageType] = 0;
                }
                enemy.resistances[damageType] = Math.min(0.8, enemy.resistances[damageType] + 0.1);
            });
        }
    }
    
    createQuantumEffect(x, y) {
        this.effects.push({
            type: 'quantum',
            x: x,
            y: y,
            size: 30,
            life: 30,
            opacity: 1
        });
    }
    
    updatePortals() {
        this.portals.forEach(portal => {
            if (portal.cooldown > 0) {
                portal.cooldown -= 16;
            }
            
            // Активация портала при приближении врагов
            if (!portal.active && portal.cooldown <= 0) {
                for (const enemy of this.enemies) {
                    if (this.distance(enemy.x, enemy.y, portal.x, portal.y) < 30) {
                        portal.active = true;
                        portal.cooldown = 5000; // 5 секунд перезарядки
                        
                        // Телепортируем врага
                        enemy.x = portal.targetX;
                        enemy.y = portal.targetY;
                        
                        this.createPortalEffect(portal.x, portal.y);
                        this.createPortalEffect(portal.targetX, portal.targetY);
                        break;
                    }
                }
            }
            
            if (portal.active && portal.cooldown <= 4000) {
                portal.active = false;
            }
        });
    }
    
    createPortalEffect(x, y) {
        this.effects.push({
            type: 'portal',
            x: x,
            y: y,
            size: 40,
            life: 60,
            opacity: 1
        });
    }
    
    updateShields() {
        this.shields.forEach(shield => {
            // Регенерация щита
            if (shield.currentStrength < shield.maxStrength) {
                shield.currentStrength = Math.min(shield.maxStrength, shield.currentStrength + shield.regen);
            }
            
            // Проверка на попадание снарядов
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const projectile = this.projectiles[i];
                if (this.distance(projectile.x, projectile.y, shield.x, shield.y) < shield.radius) {
                    // Щит поглощает урон
                    shield.currentStrength -= projectile.damage;
                    this.projectiles.splice(i, 1);
                    
                    if (shield.currentStrength <= 0) {
                        // Щит разрушен
                        this.shields = this.shields.filter(s => s !== shield);
                        this.createExplosion(shield.x, shield.y, '#3498db', shield.radius);
                    }
                    break;
                }
            }
        });
    }
    
    updateGameTimer() {
        this.gameTime++;
        const minutes = Math.floor(this.gameTime / 3600);
        const seconds = Math.floor((this.gameTime % 3600) / 60);
        this.gameTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    drawMultiplePaths() {
        this.paths.forEach((path, index) => {
            let strokeStyle, lineWidth;
            
            switch (index) {
                case 0: // Основной путь
                    strokeStyle = '#8B4513';
                    lineWidth = 30;
                    break;
                case 1: // Воздушный путь
                    strokeStyle = 'rgba(52, 152, 219, 0.6)';
                    lineWidth = 20;
                    break;
                case 2: // Подземный путь
                    strokeStyle = 'rgba(139, 69, 19, 0.8)';
                    lineWidth = 25;
                    break;
            }
            
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y);
            }
            this.ctx.stroke();
        });
    }
    
    drawResourceNodes() {
        this.resourceNodes.forEach(node => {
            const now = Date.now();
            const available = now - node.lastHarvest >= node.respawnTime;
            
            if (available) {
                let color;
                switch (node.type) {
                    case 'gold': color = '#f1c40f'; break;
                    case 'crystal': color = '#9b59b6'; break;
                    case 'energy': color = '#3498db'; break;
                }
                
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }
    
    drawPortals() {
        this.portals.forEach(portal => {
            if (portal.active || portal.cooldown > 0) {
                const alpha = portal.active ? 1 : 0.3;
                
                this.ctx.globalAlpha = alpha;
                this.ctx.strokeStyle = '#8e44ad';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(portal.x, portal.y, 20, 0, Math.PI * 2);
                this.ctx.stroke();
                
                this.ctx.fillStyle = 'rgba(142, 68, 173, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(portal.x, portal.y, 20, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    drawShields() {
        this.shields.forEach(shield => {
            const strengthPercent = shield.currentStrength / shield.maxStrength;
            
            this.ctx.strokeStyle = `rgba(52, 152, 219, ${strengthPercent})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(shield.x, shield.y, shield.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.fillStyle = `rgba(52, 152, 219, ${strengthPercent * 0.1})`;
            this.ctx.beginPath();
            this.ctx.arc(shield.x, shield.y, shield.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawAdvancedEnemyEffects(enemy) {
        // Стелс эффект
        if (enemy.stealthActive) {
            this.ctx.globalAlpha = 0.3;
        }
        
        // Фазовый сдвиг
        if (enemy.phaseActive) {
            this.ctx.strokeStyle = '#9b59b6';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size + 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Берсерк эффект
        if (enemy.rageActive) {
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size + 8, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Адаптация индикатор
        if (enemy.adaptation) {
            const adaptationLevel = Object.keys(enemy.resistances).length;
            for (let i = 0; i < adaptationLevel; i++) {
                this.ctx.fillStyle = '#1abc9c';
                this.ctx.beginPath();
                this.ctx.arc(enemy.x + enemy.size + 5 + i * 6, enemy.y + enemy.size, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawTimeDistortion() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 100 + Math.sin(Date.now() / 200) * 20;
        
        this.ctx.strokeStyle = '#9b59b6';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Дополнительные кольца
        for (let i = 1; i <= 3; i++) {
            this.ctx.globalAlpha = 0.3 / i;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius + i * 30, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;
    }
    
    // Переопределяем метод spawnEnemy для поддержки множественных путей
    spawnEnemy() {
        if (this.enemiesSpawned >= this.currentWave.length) return;
        
        const now = Date.now();
        if (now - this.lastEnemySpawn < this.timeBetweenEnemies) return;
        
        const enemyType = this.currentWave[this.enemiesSpawned];
        
        // Выбираем путь в зависимости от типа врага
        let pathIndex = 0;
        if (enemyType === 'flying' || enemyType === 'phantom') {
            pathIndex = 1; // Воздушный путь
        } else if (enemyType === 'stealth' || Math.random() < 0.2) {
            pathIndex = 2; // Подземный путь
        }
        
        this.spawnEnemyOnPath(enemyType, pathIndex);
        this.enemiesSpawned++;
        this.lastEnemySpawn = now;
    }
    
    // Переопределяем updateEnemies для поддержки новых механик
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Обновление эффектов
            this.updateEnemyEffects(enemy);
            this.updateAdvancedEnemyBehavior(enemy);
            
            // Применение временных эффектов
            let speedMultiplier = 1;
            if (this.timeEffects.timeWarp.active) {
                speedMultiplier *= this.timeEffects.timeWarp.strength;
            }
            
            // Движение по пути
            if (enemy.pathIndex < enemy.path.length - 1) {
                const currentPoint = enemy.path[enemy.pathIndex];
                const nextPoint = enemy.path[enemy.pathIndex + 1];
                
                const dx = nextPoint.x - currentPoint.x;
                const dy = nextPoint.y - currentPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const moveDistance = enemy.speed * enemy.slowEffect * speedMultiplier;
                enemy.pathProgress += moveDistance / distance;
                
                if (enemy.pathProgress >= 1) {
                    enemy.pathIndex++;
                    enemy.pathProgress = 0;
                } else {
                    enemy.x = currentPoint.x + dx * enemy.pathProgress;
                    enemy.y = currentPoint.y + dy * enemy.pathProgress;
                }
            } else {
                // Враг дошел до конца
                const damage = enemy.isBoss ? 5 : enemy.isTitan ? 3 : 1;
                this.lives -= damage;
                this.enemies.splice(i, 1);
                this.showEffect(`-${damage} жизн${damage > 1 ? 'и' : 'ь'}!`, '#e74c3c');
                
                // Штраф к репутации с Альянсом
                this.factions.alliance.reputation = Math.max(0, this.factions.alliance.reputation - 5);
            }
            
            // Удаление мертвых врагов
            if (enemy.health <= 0) {
                const baseReward = enemy.reward * (1 + this.research.economy * 0.25);
                let finalReward = baseReward;
                
                // Бонус от дружественных фракций
                if (this.factions.traders.status === 'friendly') {
                    finalReward *= 1.2;
                }
                
                this.gold += finalReward;
                this.totalGoldEarned += finalReward;
                this.enemiesKilled++;
                this.perfectWaveKills++;
                this.score += enemy.reward * 10;
                this.researchPoints += enemy.isBoss ? 5 : enemy.isTitan ? 3 : 1;
                
                // Квестовые события
                this.onEnemyKilled(enemy);
                this.onGoldEarned(finalReward);
                
                // Увеличиваем счетчик убийств для башни
                this.towers.forEach(tower => {
                    if (tower.target === enemy) {
                        tower.kills++;
                    }
                });
                
                this.enemies.splice(i, 1);
                this.createExplosion(enemy.x, enemy.y, enemy.color);
                this.showEffect(`+${Math.floor(finalReward)} золота`, '#f39c12');
                
                if (this.enemiesKilled === 1) {
                    this.unlockAchievement('firstKill');
                }
                
                // Улучшение репутации с Альянсом за убийство врагов
                this.factions.alliance.reputation = Math.min(100, this.factions.alliance.reputation + 0.5);
            }
        }
    }
    
    // Переопределяем generateWave для новых типов врагов
    generateWave() {
        this.currentWave = [];
        const waveSize = 10 + this.wave * 2;
        this.bossWave = this.wave % 10 === 0;
        const titanWave = this.wave % 15 === 0;
        
        if (this.bossWave) {
            // Босс волна
            this.currentWave.push('boss');
            for (let i = 0; i < 8; i++) {
                const rand = Math.random();
                if (rand < 0.3) this.currentWave.push('basic');
                else if (rand < 0.6) this.currentWave.push('fast');
                else this.currentWave.push('tank');
            }
            this.showBossWarning();
        } else if (titanWave) {
            // Титан волна
            this.currentWave.push('titan');
            for (let i = 0; i < 6; i++) {
                this.currentWave.push('shielded');
            }
            this.showTitanWarning();
        } else {
            // Обычная волна с новыми типами врагов
            for (let i = 0; i < waveSize; i++) {
                let enemyType;
                const rand = Math.random();
                
                if (this.wave < 3) {
                    enemyType = rand < 0.7 ? 'basic' : 'fast';
                } else if (this.wave < 6) {
                    if (rand < 0.3) enemyType = 'basic';
                    else if (rand < 0.6) enemyType = 'fast';
                    else if (rand < 0.85) enemyType = 'tank';
                    else enemyType = 'stealth';
                } else if (this.wave < 10) {
                    if (rand < 0.2) enemyType = 'basic';
                    else if (rand < 0.35) enemyType = 'fast';
                    else if (rand < 0.5) enemyType = 'tank';
                    else if (rand < 0.65) enemyType = 'flying';
                    else if (rand < 0.8) enemyType = 'regenerating';
                    else if (rand < 0.9) enemyType = 'stealth';
                    else enemyType = 'berserker';
                } else if (this.wave < 20) {
                    if (rand < 0.15) enemyType = 'basic';
                    else if (rand < 0.25) enemyType = 'fast';
                    else if (rand < 0.35) enemyType = 'tank';
                    else if (rand < 0.45) enemyType = 'flying';
                    else if (rand < 0.55) enemyType = 'regenerating';
                    else if (rand < 0.65) enemyType = 'shielded';
                    else if (rand < 0.75) enemyType = 'stealth';
                    else if (rand < 0.85) enemyType = 'berserker';
                    else if (rand < 0.92) enemyType = 'teleporter';
                    else enemyType = 'swarm';
                } else {
                    // Поздние волны - все типы врагов
                    const allTypes = ['basic', 'fast', 'tank', 'flying', 'regenerating', 'shielded', 
                                    'stealth', 'berserker', 'teleporter', 'swarm', 'phantom', 'cybernetic'];
                    enemyType = allTypes[Math.floor(Math.random() * allTypes.length)];
                }
                
                this.currentWave.push(enemyType);
            }
        }
        
        this.updateNextWaveInfo();
    }
    
    showTitanWarning() {
        const warning = document.createElement('div');
        warning.className = 'boss-warning';
        warning.innerHTML = `
            <h3><i class="fas fa-mountain me-2"></i>ВНИМАНИЕ!</h3>
            <p>Приближается ТИТАН!</p>
            <p>Волна ${this.wave}</p>
        `;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            warning.remove();
        }, 3000);
    }
    
    // Переопределяем placeTower для поддержки новых типов башен
    placeTower(x, y) {
        if (!this.canPlaceTower(x, y)) {
            this.showEffect('Нельзя разместить здесь!', '#e74c3c');
            return;
        }
        
        const towerType = this.towerTypes[this.selectedTowerType];
        const energyCost = towerType.energyCost || 0;
        
        if (this.energy < energyCost) {
            this.showEffect('Недостаточно энергии!', '#e74c3c');
            return;
        }
        
        const tower = {
            x: x,
            y: y,
            type: this.selectedTowerType,
            level: 1,
            damage: towerType.damage,
            range: towerType.range,
            fireRate: towerType.fireRate,
            lastShot: 0,
            target: null,
            weatherBonus: 1,
            specialized: false,
            kills: 0,
            totalDamage: 0,
            ...towerType
        };
        
        // Специальная инициализация для щитовых генераторов
        if (tower.shield) {
            this.shields.push({
                x: x,
                y: y,
                radius: tower.range,
                maxStrength: tower.shieldStrength,
                currentStrength: tower.shieldStrength,
                regen: tower.shieldRegen
            });
        }
        
        this.towers.push(tower);
        this.gold -= towerType.cost;
        this.energy -= energyCost;
        this.cancelTowerPlacement();
        this.onTowerBuilt();
        this.updateUI();
        this.showEffect(`Башня построена! -${towerType.cost} золота`, '#27ae60');
    }
    
    // Добавляем поддержку орбитальных и квантовых атак
    createProjectile(tower, target) {
        const baseDamage = tower.damage * (1 + this.research.damage * 0.1) * (tower.weatherBonus || 1);
        const isCritical = Math.random() < tower.critChance;
        const finalDamage = isCritical ? baseDamage * 2 : baseDamage;
        
        // Орбитальная пушка
        if (tower.orbital) {
            this.createOrbitalStrike(target.x, target.y, finalDamage);
            return;
        }
        
        // Квантовая башня
        if (tower.quantum) {
            this.createQuantumProjectile(tower, target, finalDamage, isCritical);
            return;
        }
        
        // Обычные снаряды
        const projectile = {
            x: tower.x,
            y: tower.y,
            targetX: target.x,
            targetY: target.y,
            target: target,
            damage: finalDamage,
            speed: tower.projectileSpeed,
            color: tower.color,
            type: tower.type,
            critical: isCritical,
            tower: tower,
            ...tower
        };
        
        // Мультивыстрел
        if (tower.multiShot) {
            for (let i = 0; i < tower.multiShot; i++) {
                const spreadAngle = (i - (tower.multiShot - 1) / 2) * 0.2;
                const spreadProjectile = { ...projectile };
                spreadProjectile.targetX += Math.sin(spreadAngle) * 20;
                spreadProjectile.targetY += Math.cos(spreadAngle) * 20;
                this.projectiles.push(spreadProjectile);
            }
        } else {
            this.projectiles.push(projectile);
        }
    }
    
    createOrbitalStrike(x, y, damage) {
        // Создаем орбитальный луч
        const beam = document.createElement('div');
        beam.className = 'orbital-beam';
        beam.style.left = x + 'px';
        beam.style.top = '0px';
        beam.style.height = y + 'px';
        
        this.canvas.parentElement.appendChild(beam);
        
        setTimeout(() => {
            beam.remove();
            
            // Урон всем врагам в радиусе
            this.enemies.forEach(enemy => {
                const distance = this.distance(x, y, enemy.x, enemy.y);
                if (distance < 50) {
                    this.damageEnemy(enemy, damage * (1 - distance / 50), { type: 'orbital', critical: true });
                }
            });
            
            this.createExplosion(x, y, '#f1c40f', 50);
        }, 1000);
    }
    
    createQuantumProjectile(tower, target, damage, critical) {
        // Квантовый снаряд мгновенно телепортируется к цели
        if (Math.random() < tower.teleportChance) {
            // Мгновенное попадание
            this.damageEnemy(target, damage, { type: 'quantum', critical: critical });
            this.createQuantumEffect(target.x, target.y);
        } else {
            // Обычный снаряд
            const projectile = {
                x: tower.x,
                y: tower.y,
                targetX: target.x,
                targetY: target.y,
                target: target,
                damage: damage,
                speed: tower.projectileSpeed,
                color: tower.color,
                type: tower.type,
                critical: critical,
                quantum: true
            };
            
            this.projectiles.push(projectile);
        }
    }
}
    
    // ===== СИСТЕМА КВЕСТОВ =====
    
    initializeQuests() {
        // Генерируем начальные квесты
        this.generateInitialQuests();
        this.generateDailyQuests();
        this.updateQuestUI();
    }
    
    generateInitialQuests() {
        // Добавляем базовые квесты для новых игроков
        const initialQuests = ['killEnemies', 'buildTowers', 'earnGold', 'surviveWaves'];
        
        initialQuests.forEach(questId => {
            const quest = this.createQuestFromTemplate(questId);
            if (quest) {
                this.quests.active.push(quest);
                this.questProgress[quest.id] = 0;
            }
        });
    }
    
    generateDailyQuests() {
        // Проверяем, нужно ли сбросить ежедневные квесты
        const now = Date.now();
        const daysPassed = Math.floor((now - this.lastDailyReset) / (24 * 60 * 60 * 1000));
        
        if (daysPassed >= 1 || this.quests.daily.length === 0) {
            this.quests.daily = [];
            this.lastDailyReset = now;
            
            // Генерируем новые ежедневные квесты
            const dailyQuestIds = ['dailyKills', 'dailyWaves'];
            dailyQuestIds.forEach(questId => {
                const quest = this.createQuestFromTemplate(questId);
                if (quest) {
                    this.quests.daily.push(quest);
                    this.questProgress[quest.id] = 0;
                }
            });
        }
    }
    
    createQuestFromTemplate(templateId) {
        const template = this.questTemplates[templateId];
        if (!template) return null;
        
        const quest = {
            ...template,
            id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            templateId: templateId,
            startTime: Date.now(),
            progress: 0,
            completed: false
        };
        
        // Масштабируем цели в зависимости от уровня игрока
        if (quest.type !== 'daily' && quest.type !== 'legendary') {
            const levelMultiplier = 1 + (this.playerLevel - 1) * 0.2;
            quest.target = Math.floor(quest.target * levelMultiplier);
            
            // Масштабируем награды
            if (quest.reward.experience) {
                quest.reward.experience = Math.floor(quest.reward.experience * levelMultiplier);
            }
            if (quest.reward.gold) {
                quest.reward.gold = Math.floor(quest.reward.gold * levelMultiplier);
            }
        }
        
        return quest;
    }
    
    updateQuestProgress(type, amount = 1, data = {}) {
        let questsToUpdate = [...this.quests.active, ...this.quests.daily];
        
        questsToUpdate.forEach(quest => {
            let shouldUpdate = false;
            
            switch (quest.templateId) {
                case 'killEnemies':
                case 'dailyKills':
                    if (type === 'enemy_killed') shouldUpdate = true;
                    break;
                    
                case 'killBoss':
                    if (type === 'boss_killed') shouldUpdate = true;
                    break;
                    
                case 'surviveWaves':
                case 'dailyWaves':
                    if (type === 'wave_completed') shouldUpdate = true;
                    break;
                    
                case 'earnGold':
                    if (type === 'gold_earned') shouldUpdate = true;
                    break;
                    
                case 'buildTowers':
                    if (type === 'tower_built') shouldUpdate = true;
                    break;
                    
                case 'upgradeTowers':
                    if (type === 'tower_upgraded') shouldUpdate = true;
                    break;
                    
                case 'completeResearch':
                    if (type === 'research_completed') shouldUpdate = true;
                    break;
                    
                case 'perfectWave':
                    if (type === 'perfect_wave') shouldUpdate = true;
                    break;
                    
                case 'useAbilities':
                    if (type === 'ability_used') shouldUpdate = true;
                    break;
                    
                case 'improveDiplomacy':
                    if (type === 'diplomacy_improved' && data.status === 'friendly') shouldUpdate = true;
                    break;
                    
                case 'masterDefender':
                    if (type === 'wave_completed' && data.wave >= 50) shouldUpdate = true;
                    break;
            }
            
            if (shouldUpdate && !quest.completed) {
                this.questProgress[quest.id] = Math.min(
                    (this.questProgress[quest.id] || 0) + amount,
                    quest.target
                );
                
                quest.progress = this.questProgress[quest.id];
                
                if (quest.progress >= quest.target) {
                    this.completeQuest(quest);
                }
            }
        });
        
        this.updateQuestUI();
    }
    
    completeQuest(quest) {
        quest.completed = true;
        quest.completedTime = Date.now();
        
        // Выдаем награды
        if (quest.reward.experience) {
            this.gainExperience(quest.reward.experience);
        }
        if (quest.reward.gold) {
            this.gold += quest.reward.gold;
        }
        if (quest.reward.crystals) {
            this.crystals += quest.reward.crystals;
        }
        
        // Перемещаем квест в завершенные
        if (quest.type === 'daily') {
            const index = this.quests.daily.indexOf(quest);
            if (index > -1) {
                this.quests.daily.splice(index, 1);
            }
        } else {
            const index = this.quests.active.indexOf(quest);
            if (index > -1) {
                this.quests.active.splice(index, 1);
            }
        }
        
        this.quests.completed.push(quest);
        
        // Показываем уведомление
        this.showQuestNotification(quest);
        
        // Создаем визуальный эффект
        this.createQuestCompleteEffect();
        
        // Генерируем новый квест взамен завершенного
        if (quest.type !== 'daily' && quest.type !== 'legendary') {
            this.generateNewQuest();
        }
        
        // Проверяем разблокировку новых квестов
        this.checkQuestUnlocks();
    }
    
    gainExperience(amount) {
        this.experience += amount;
        
        // Проверяем повышение уровня
        while (this.experience >= this.experienceToNext) {
            this.experience -= this.experienceToNext;
            this.playerLevel++;
            this.experienceToNext = Math.floor(this.experienceToNext * 1.5);
            
            this.showLevelUpEffect();
            this.onLevelUp();
        }
    }
    
    onLevelUp() {
        // Бонусы за повышение уровня
        this.gold += this.playerLevel * 100;
        this.crystals += Math.floor(this.playerLevel / 5);
        
        // Разблокируем новые квесты
        this.checkQuestUnlocks();
        
        this.showEffect(`Уровень повышен! Уровень ${this.playerLevel}`, '#f1c40f');
    }
    
    generateNewQuest() {
        const availableQuests = Object.keys(this.questTemplates).filter(templateId => {
            const template = this.questTemplates[templateId];
            return template.type !== 'daily' && template.type !== 'legendary' &&
                   !this.quests.active.some(q => q.templateId === templateId);
        });
        
        if (availableQuests.length > 0) {
            const randomQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
            const quest = this.createQuestFromTemplate(randomQuest);
            if (quest) {
                this.quests.active.push(quest);
                this.questProgress[quest.id] = 0;
            }
        }
    }
    
    checkQuestUnlocks() {
        // Разблокируем легендарные квесты на высоких уровнях
        if (this.playerLevel >= 10 && !this.quests.active.some(q => q.templateId === 'masterDefender')) {
            const legendaryQuest = this.createQuestFromTemplate('masterDefender');
            if (legendaryQuest) {
                this.quests.active.push(legendaryQuest);
                this.questProgress[legendaryQuest.id] = 0;
                this.showQuestNotification(legendaryQuest, 'Разблокирован легендарный квест!');
            }
        }
    }
    
    showQuestNotification(quest, customMessage = null) {
        const notification = document.createElement('div');
        notification.className = 'quest-notification';
        
        const message = customMessage || `Квест завершен: ${quest.title}`;
        let rewardText = '';
        
        if (quest.reward.experience) rewardText += `+${quest.reward.experience} опыта `;
        if (quest.reward.gold) rewardText += `+${quest.reward.gold} золота `;
        if (quest.reward.crystals) rewardText += `+${quest.reward.crystals} кристаллов`;
        
        notification.innerHTML = `
            <div><i class="${quest.icon} me-2"></i><strong>${message}</strong></div>
            ${rewardText ? `<div class="mt-1"><small>${rewardText}</small></div>` : ''}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    createQuestCompleteEffect() {
        const effect = document.createElement('div');
        effect.className = 'quest-complete-effect';
        effect.style.left = (this.canvas.width / 2 - 50) + 'px';
        effect.style.top = (this.canvas.height / 2 - 50) + 'px';
        
        this.canvas.parentElement.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 1000);
    }
    
    showLevelUpEffect() {
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        effect.innerHTML = `
            <h3><i class="fas fa-star me-2"></i>УРОВЕНЬ ПОВЫШЕН!</h3>
            <p>Уровень ${this.playerLevel}</p>
            <p>+${this.playerLevel * 100} золота</p>
            ${Math.floor(this.playerLevel / 5) > 0 ? `<p>+${Math.floor(this.playerLevel / 5)} кристаллов</p>` : ''}
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 3000);
    }
    
    switchQuestTab(tabName) {
        // Обновляем активную вкладку
        document.querySelectorAll('.quest-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Показываем соответствующий список квестов
        document.querySelectorAll('.quest-list').forEach(list => {
            list.classList.add('d-none');
        });
        
        const targetList = document.getElementById(`${tabName}Quests`);
        if (targetList) {
            targetList.classList.remove('d-none');
        }
    }
    
    updateQuestUI() {
        this.updateQuestList('active', this.quests.active);
        this.updateQuestList('completed', this.quests.completed.slice(-10)); // Показываем последние 10
        this.updateQuestList('daily', this.quests.daily);
        
        // Обновляем информацию об опыте и уровне
        if (this.experienceElement) {
            this.experienceElement.textContent = `${this.experience}/${this.experienceToNext}`;
        }
        if (this.playerLevelElement) {
            this.playerLevelElement.textContent = this.playerLevel;
        }
    }
    
    updateQuestList(listType, quests) {
        const listElement = document.getElementById(`${listType}Quests`);
        if (!listElement) return;
        
        listElement.innerHTML = '';
        
        quests.forEach(quest => {
            const questElement = document.createElement('div');
            questElement.className = `quest-item ${quest.type === 'daily' ? 'daily' : ''} ${quest.type === 'legendary' ? 'legendary' : ''} ${quest.completed ? 'completed' : ''}`;
            
            const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);
            
            questElement.innerHTML = `
                <div class="quest-difficulty ${quest.difficulty}">${quest.difficulty.toUpperCase()}</div>
                <div class="fw-bold">
                    <i class="${quest.icon} me-2"></i>${quest.title}
                </div>
                <div class="quest-description">
                    ${quest.description.replace('{target}', quest.target)}
                </div>
                <div class="quest-progress">
                    <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <small>${quest.progress}/${quest.target}</small>
                    <div class="quest-reward">
                        ${quest.reward.experience ? `<span><i class="fas fa-star"></i>${quest.reward.experience}</span>` : ''}
                        ${quest.reward.gold ? `<span><i class="fas fa-coins"></i>${quest.reward.gold}</span>` : ''}
                        ${quest.reward.crystals ? `<span><i class="fas fa-gem"></i>${quest.reward.crystals}</span>` : ''}
                    </div>
                </div>
            `;
            
            listElement.appendChild(questElement);
        });
        
        if (quests.length === 0) {
            const emptyElement = document.createElement('div');
            emptyElement.className = 'text-center text-muted';
            emptyElement.innerHTML = '<small>Нет квестов</small>';
            listElement.appendChild(emptyElement);
        }
    }
    
    // Интеграция квестов с игровыми событиями
    onEnemyKilled(enemy) {
        this.updateQuestProgress('enemy_killed', 1);
        if (enemy.isBoss) {
            this.updateQuestProgress('boss_killed', 1);
        }
    }
    
    onWaveCompleted(waveNumber, perfect = false) {
        this.updateQuestProgress('wave_completed', 1, { wave: waveNumber });
        if (perfect) {
            this.updateQuestProgress('perfect_wave', 1);
        }
    }
    
    onTowerBuilt() {
        this.updateQuestProgress('tower_built', 1);
    }
    
    onTowerUpgraded() {
        this.updateQuestProgress('tower_upgraded', 1);
    }
    
    onResearchCompleted() {
        this.updateQuestProgress('research_completed', 1);
    }
    
    onAbilityUsed() {
        this.updateQuestProgress('ability_used', 1);
    }
    
    onGoldEarned(amount) {
        this.updateQuestProgress('gold_earned', amount);
    }
    
    onDiplomacyChanged(faction, newStatus) {
        this.updateQuestProgress('diplomacy_improved', 1, { faction, status: newStatus });
    }