// 地图画布配置
var MAP_WIDTH = 1000;
var MAP_HEIGHT = 600;

class RealisticOfficeFloorPlan {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;
    this.devices = [];
    this.svgNS = 'http://www.w3.org/2000/svg';
    this.svg = null;
    this.init();
  }

  init() {
    this.container.innerHTML = '';
    this.container.style.cssText = 'background:#2c3e50;border-radius:12px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.1);position:relative;';

    var title = document.createElement('div');
    title.style.cssText = 'color:#fff;font-size:18px;font-weight:600;margin-bottom:15px;text-align:center;text-shadow:0 2px 4px rgba(0,0,0,0.3);';
    title.innerHTML = '<i class="fas fa-building"></i> 设备资产定位管理系统 - 15F 办公楼层平面图';
    this.container.appendChild(title);

    var mapWrapper = document.createElement('div');
    mapWrapper.style.cssText = 'background:#fff;border-radius:8px;padding:15px;box-shadow:0 4px 20px rgba(0,0,0,0.15);position:relative;';
    this.container.appendChild(mapWrapper);

    this.svg = document.createElementNS(this.svgNS, 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', this.height);
    this.svg.setAttribute('viewBox', '0 0 ' + this.width + ' ' + this.height);
    this.svg.style.backgroundColor = '#f8f9fa';
    this.svg.style.borderRadius = '6px';
    this.svg.style.border = '1px solid #e9ecef';
    mapWrapper.appendChild(this.svg);

    this.addDefinitions();
    this.drawRealisticOfficeLayout();
    this.loadDeviceLocations();
    this.addLegendAndScale();
  }

  addDefinitions() {
    const defs = document.createElementNS(this.svgNS, "defs");

    const officeGradient = document.createElementNS(
      this.svgNS,
      "linearGradient"
    );
    officeGradient.setAttribute("id", "officeGradient");
    officeGradient.setAttribute("x1", "0%");
    officeGradient.setAttribute("y1", "0%");
    officeGradient.setAttribute("x2", "100%");
    officeGradient.setAttribute("y2", "100%");

    const stop1 = document.createElementNS(this.svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#f8f9fa");

    const stop2 = document.createElementNS(this.svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#e9ecef");

    officeGradient.appendChild(stop1);
    officeGradient.appendChild(stop2);
    defs.appendChild(officeGradient);

    const publicGradient = document.createElementNS(
      this.svgNS,
      "linearGradient"
    );
    publicGradient.setAttribute("id", "publicGradient");
    publicGradient.setAttribute("x1", "0%");
    publicGradient.setAttribute("y1", "0%");
    publicGradient.setAttribute("x2", "100%");
    publicGradient.setAttribute("y2", "100%");

    const grayStop1 = document.createElementNS(this.svgNS, "stop");
    grayStop1.setAttribute("offset", "0%");
    grayStop1.setAttribute("stop-color", "#d5dbdb");

    const grayStop2 = document.createElementNS(this.svgNS, "stop");
    grayStop2.setAttribute("offset", "100%");
    grayStop2.setAttribute("stop-color", "#bdc3c7");

    publicGradient.appendChild(grayStop1);
    publicGradient.appendChild(grayStop2);
    defs.appendChild(publicGradient);

    const filter = document.createElementNS(this.svgNS, "filter");
    filter.setAttribute("id", "buildingShadow");
    filter.setAttribute("x", "-20%");
    filter.setAttribute("y", "-20%");
    filter.setAttribute("width", "140%");
    filter.setAttribute("height", "140%");

    const shadow = document.createElementNS(this.svgNS, "feDropShadow");
    shadow.setAttribute("dx", "3");
    shadow.setAttribute("dy", "3");
    shadow.setAttribute("stdDeviation", "4");
    shadow.setAttribute("flood-color", "rgba(0,0,0,0.15)");

    filter.appendChild(shadow);
    defs.appendChild(filter);

    this.svg.appendChild(defs);
  }

  drawRealisticOfficeLayout() {
    this.drawBuildingOutline();
    this.drawPublicAreas();
    this.drawConnectedOfficeAreas();
    this.drawBuildingDetails();
  }

  drawBuildingOutline() {
    // L型写字楼外轮廓
    const buildingPath = `
            M 50 50 
            L 900 50 
            L 900 300 
            L 750 300 
            L 750 520 
            L 50 520 
            Z
        `;

    const building = document.createElementNS(this.svgNS, "path");
    building.setAttribute("d", buildingPath);
    building.setAttribute("fill", "url(#officeGradient)");
    building.setAttribute("stroke", "#2c3e50");
    building.setAttribute("stroke-width", "3");
    building.setAttribute("filter", "url(#buildingShadow)");
    this.svg.appendChild(building);

    const buildingName = document.createElementNS(this.svgNS, "text");
    buildingName.setAttribute("x", "475");
    buildingName.setAttribute("y", "30");
    buildingName.setAttribute("text-anchor", "middle");
    buildingName.setAttribute("font-size", "16");
    buildingName.setAttribute("font-weight", "bold");
    buildingName.setAttribute("fill", "#2c3e50");
    buildingName.textContent = "设备资产定位管理系统 15F";
    this.svg.appendChild(buildingName);
  }

  drawPublicAreas() {
    const elevatorShaft = document.createElementNS(this.svgNS, "rect");
    elevatorShaft.setAttribute("x", "420");
    elevatorShaft.setAttribute("y", "225");
    elevatorShaft.setAttribute("width", "50");
    elevatorShaft.setAttribute("height", "30");
    elevatorShaft.setAttribute("fill", "url(#publicGradient)");
    elevatorShaft.setAttribute("stroke", "#7f8c8d");
    elevatorShaft.setAttribute("stroke-width", "2");
    elevatorShaft.setAttribute("rx", "4");
    this.svg.appendChild(elevatorShaft);

    const elevatorText = document.createElementNS(this.svgNS, "text");
    elevatorText.setAttribute("x", "445");
    elevatorText.setAttribute("y", "235");
    elevatorText.setAttribute("text-anchor", "middle");
    elevatorText.setAttribute("font-size", "8");
    elevatorText.setAttribute("font-weight", "bold");
    elevatorText.setAttribute("fill", "#34495e");
    elevatorText.textContent = "🛗";
    this.svg.appendChild(elevatorText);

    const elevatorLabel = document.createElementNS(this.svgNS, "text");
    elevatorLabel.setAttribute("x", "445");
    elevatorLabel.setAttribute("y", "248");
    elevatorLabel.setAttribute("text-anchor", "middle");
    elevatorLabel.setAttribute("font-size", "7");
    elevatorLabel.setAttribute("fill", "#34495e");
    elevatorLabel.textContent = "电梯";
    this.svg.appendChild(elevatorLabel);

    const staircase = document.createElementNS(this.svgNS, "rect");
    staircase.setAttribute("x", "480");
    staircase.setAttribute("y", "225");
    staircase.setAttribute("width", "50");
    staircase.setAttribute("height", "30");
    staircase.setAttribute("fill", "url(#publicGradient)");
    staircase.setAttribute("stroke", "#7f8c8d");
    staircase.setAttribute("stroke-width", "2");
    staircase.setAttribute("rx", "4");
    this.svg.appendChild(staircase);

    this.drawLadderIcon(505, 240);

    const stairLabel = document.createElementNS(this.svgNS, "text");
    stairLabel.setAttribute("x", "505");
    stairLabel.setAttribute("y", "248");
    stairLabel.setAttribute("text-anchor", "middle");
    stairLabel.setAttribute("font-size", "7");
    stairLabel.setAttribute("fill", "#34495e");
    stairLabel.textContent = "楼梯";
    this.svg.appendChild(stairLabel);

    const restroom = document.createElementNS(this.svgNS, "rect");
    restroom.setAttribute("x", "360");
    restroom.setAttribute("y", "225");
    restroom.setAttribute("width", "50");
    restroom.setAttribute("height", "30");
    restroom.setAttribute("fill", "url(#publicGradient)");
    restroom.setAttribute("stroke", "#7f8c8d");
    restroom.setAttribute("stroke-width", "2");
    restroom.setAttribute("rx", "4");
    this.svg.appendChild(restroom);

    const restroomIcon = document.createElementNS(this.svgNS, "text");
    restroomIcon.setAttribute("x", "385");
    restroomIcon.setAttribute("y", "235");
    restroomIcon.setAttribute("text-anchor", "middle");
    restroomIcon.setAttribute("font-size", "8");
    restroomIcon.textContent = "🚻";
    this.svg.appendChild(restroomIcon);

    const restroomLabel = document.createElementNS(this.svgNS, "text");
    restroomLabel.setAttribute("x", "385");
    restroomLabel.setAttribute("y", "248");
    restroomLabel.setAttribute("text-anchor", "middle");
    restroomLabel.setAttribute("font-size", "7");
    restroomLabel.setAttribute("fill", "#34495e");
    restroomLabel.textContent = "卫生间";
    this.svg.appendChild(restroomLabel);
  }

  drawLadderIcon(x, y) {
    const ladder = document.createElementNS(this.svgNS, "g");

    const ladderLeft = document.createElementNS(this.svgNS, "line");
    ladderLeft.setAttribute("x1", x - 10);
    ladderLeft.setAttribute("y1", y - 10);
    ladderLeft.setAttribute("x2", x - 10);
    ladderLeft.setAttribute("y2", y + 10);
    ladderLeft.setAttribute("stroke", "#34495e");
    ladderLeft.setAttribute("stroke-width", "2");
    ladder.appendChild(ladderLeft);

    const ladderRight = document.createElementNS(this.svgNS, "line");
    ladderRight.setAttribute("x1", x + 10);
    ladderRight.setAttribute("y1", y - 10);
    ladderRight.setAttribute("x2", x + 10);
    ladderRight.setAttribute("y2", y + 10);
    ladderRight.setAttribute("stroke", "#34495e");
    ladderRight.setAttribute("stroke-width", "2");
    ladder.appendChild(ladderRight);

    for (let i = 0; i < 4; i++) {
      const rung = document.createElementNS(this.svgNS, "line");
      rung.setAttribute("x1", x - 10);
      rung.setAttribute("y1", y - 8 + i * 5);
      rung.setAttribute("x2", x + 10);
      rung.setAttribute("y2", y - 8 + i * 5);
      rung.setAttribute("stroke", "#34495e");
      rung.setAttribute("stroke-width", "1");
      ladder.appendChild(rung);
    }

    this.svg.appendChild(ladder);
  }

  drawConnectedOfficeAreas() {
    this.drawMainCorridor();

    const officeAreas = [
      { name: "研发部", x: 55, y: 55, width: 160, height: 160, icon: "💻" },
      { name: "设计部", x: 220, y: 55, width: 130, height: 160, icon: "🎨" },
      { name: "市场部", x: 570, y: 55, width: 130, height: 160, icon: "📊" },
      { name: "机房", x: 705, y: 55, width: 190, height: 160, icon: "🖥️" },

      {
        name: "行政部",
        x: 55,
        y: 265,
        width: 120,
        height: 250,
        icon: "📋",
        type: "office",
      },
      {
        name: "产品部",
        x: 180,
        y: 265,
        width: 140,
        height: 250,
        icon: "📱",
        type: "office",
      },
      {
        name: "技术部",
        x: 325,
        y: 265,
        width: 100,
        height: 250,
        icon: "🔧",
        type: "office",
      },
      {
        name: "运维部",
        x: 430,
        y: 265,
        width: 100,
        height: 250,
        icon: "⚙️",
        type: "office",
      },
      {
        name: "测试部",
        x: 535,
        y: 265,
        width: 100,
        height: 250,
        icon: "🔬",
        type: "office",
      },
    ];

    officeAreas.forEach((area) => {
      const fillColor = area.type === "corridor" ? "#ecf0f1" : "#e3f2fd";
      const strokeColor = area.type === "corridor" ? "#bdc3c7" : "#1976d2";
      const textColor = area.type === "corridor" ? "#7f8c8d" : "#1565c0";

      const areaBackground = document.createElementNS(this.svgNS, "rect");
      areaBackground.setAttribute("x", area.x);
      areaBackground.setAttribute("y", area.y);
      areaBackground.setAttribute("width", area.width);
      areaBackground.setAttribute("height", area.height);
      areaBackground.setAttribute("fill", fillColor);
      areaBackground.setAttribute("opacity", "0.6");
      this.svg.appendChild(areaBackground);

      const areaBorder = document.createElementNS(this.svgNS, "rect");
      areaBorder.setAttribute("x", area.x);
      areaBorder.setAttribute("y", area.y);
      areaBorder.setAttribute("width", area.width);
      areaBorder.setAttribute("height", area.height);
      areaBorder.setAttribute("fill", "none");
      areaBorder.setAttribute("stroke", strokeColor);
      areaBorder.setAttribute("stroke-width", "1");
      areaBorder.setAttribute("stroke-dasharray", "3,3");
      areaBorder.setAttribute("opacity", "0.7");
      this.svg.appendChild(areaBorder);

      const areaLabel = document.createElementNS(this.svgNS, "text");
      areaLabel.setAttribute("x", area.x + 10);
      areaLabel.setAttribute("y", area.y + 20);
      areaLabel.setAttribute("font-size", "12");
      areaLabel.setAttribute("font-weight", "bold");
      areaLabel.setAttribute("fill", textColor);
      areaLabel.textContent = `${area.icon} ${area.name}`;
      this.svg.appendChild(areaLabel);
    });

    this.drawCornerStaircase();
  }

  drawMainCorridor() {
    const horizontalCorridor = document.createElementNS(this.svgNS, "rect");
    horizontalCorridor.setAttribute("x", "55");
    horizontalCorridor.setAttribute("y", "220");
    horizontalCorridor.setAttribute("width", "840");
    horizontalCorridor.setAttribute("height", "40");
    horizontalCorridor.setAttribute("fill", "#ecf0f1");
    horizontalCorridor.setAttribute("stroke", "#bdc3c7");
    horizontalCorridor.setAttribute("stroke-width", "1");
    this.svg.appendChild(horizontalCorridor);

    const entranceArea = document.createElementNS(this.svgNS, "rect");
    entranceArea.setAttribute("x", "355");
    entranceArea.setAttribute("y", "55");
    entranceArea.setAttribute("width", "210");
    entranceArea.setAttribute("height", "160");
    entranceArea.setAttribute("fill", "#ecf0f1");
    entranceArea.setAttribute("stroke", "#bdc3c7");
    entranceArea.setAttribute("stroke-width", "1");
    this.svg.appendChild(entranceArea);

    const corridorText = document.createElementNS(this.svgNS, "text");
    corridorText.setAttribute("x", "475");
    corridorText.setAttribute("y", "245");
    corridorText.setAttribute("text-anchor", "middle");
    corridorText.setAttribute("font-size", "10");
    corridorText.setAttribute("fill", "#7f8c8d");
    corridorText.textContent = "主过道";
    this.svg.appendChild(corridorText);
  }

  drawCornerStaircase() {
    const cornerStaircase = document.createElementNS(this.svgNS, "rect");
    cornerStaircase.setAttribute("x", "750");
    cornerStaircase.setAttribute("y", "265");
    cornerStaircase.setAttribute("width", "145");
    cornerStaircase.setAttribute("height", "250");
    cornerStaircase.setAttribute("fill", "url(#publicGradient)");
    cornerStaircase.setAttribute("stroke", "#7f8c8d");
    cornerStaircase.setAttribute("stroke-width", "2");
    cornerStaircase.setAttribute("rx", "4");
    this.svg.appendChild(cornerStaircase);

    this.drawLadderIcon(822, 390);
  }

  drawBuildingDetails() {
    const windows = [
      { x1: 80, y1: 50, x2: 150, y2: 50 },
      { x1: 180, y1: 50, x2: 250, y2: 50 },
      { x1: 280, y1: 50, x2: 350, y2: 50 },
      { x1: 750, y1: 50, x2: 820, y2: 50 },
      { x1: 50, y1: 100, x2: 50, y2: 150 },
      { x1: 50, y1: 200, x2: 50, y2: 250 },
      { x1: 50, y1: 350, x2: 50, y2: 400 },
      { x1: 750, y1: 330, x2: 750, y2: 400 },
    ];

    windows.forEach((window) => {
      const windowLine = document.createElementNS(this.svgNS, "line");
      windowLine.setAttribute("x1", window.x1);
      windowLine.setAttribute("y1", window.y1);
      windowLine.setAttribute("x2", window.x2);
      windowLine.setAttribute("y2", window.y2);
      windowLine.setAttribute("stroke", "#3498db");
      windowLine.setAttribute("stroke-width", "4");
      windowLine.setAttribute("opacity", "0.8");
      this.svg.appendChild(windowLine);
    });

    const entrance = document.createElementNS(this.svgNS, "rect");
    entrance.setAttribute("x", "465");
    entrance.setAttribute("y", "47");
    entrance.setAttribute("width", "40");
    entrance.setAttribute("height", "6");
    entrance.setAttribute("fill", "#e74c3c");
    this.svg.appendChild(entrance);
  }

  loadDeviceLocations() {
    const deviceLocations = [
      {
        id: 1,
        name: "LAPTOP001",
        type: "laptop",
        x: 120,
        y: 120,
        status: "online",
        area: "研发部",
        user: "陈志华",
        location: "15F-研发部-工位R12",
        brand: "联想",
        model: "ThinkPad P1 Gen4",
        borrower: null,
      },
      {
        id: 2,
        name: "LAPTOP002",
        type: "laptop",
        x: 280,
        y: 120,
        status: "borrowed",
        area: "设计部",
        user: "刘美玲",
        location: "15F-设计部-工位D05",
        brand: "戴尔",
        model: "Precision 7560",
        borrower: "王建国",
      },
      {
        id: 3,
        name: "SERVER003",
        type: "server",
        x: 780,
        y: 120,
        status: "online",
        area: "机房",
        user: "系统管理",
        location: "15F-机房-机柜A15",
        brand: "华为",
        model: "FusionServer 2288H V5",
        borrower: null,
      },
      {
        id: 4,
        name: "WORKSTATION007",
        type: "workstation",
        x: 160,
        y: 180,
        status: "borrowed",
        area: "研发部",
        user: "胡建军",
        location: "15F-研发部-工位R08",
        brand: "惠普",
        model: "ZBook Fury 17 G8",
        borrower: "李明华",
      },
      {
        id: 5,
        name: "SERVER006",
        type: "server",
        x: 820,
        y: 180,
        status: "online",
        area: "机房",
        user: "系统管理",
        location: "15F-机房-存储区",
        brand: "戴尔",
        model: "PowerVault ME4012",
        borrower: null,
      },
      {
        id: 6,
        name: "LAPTOP005",
        type: "laptop",
        x: 620,
        y: 120,
        status: "borrowed",
        area: "市场部",
        user: "孙丽娟",
        location: "15F-市场部-工位M03",
        brand: "苹果",
        model: 'MacBook Pro 16"',
        borrower: "张小明",
      },

      {
        id: 7,
        name: "CAMERA013",
        type: "camera",
        x: 110,
        y: 380,
        status: "borrowed",
        area: "行政部",
        user: "赵雅琴",
        location: "15F-行政部-会议室",
        brand: "佳能",
        model: "EOS R5",
        borrower: "张志强",
      },
      {
        id: 8,
        name: "LAPTOP008",
        type: "laptop",
        x: 250,
        y: 380,
        status: "online",
        area: "产品部",
        user: "张小明",
        location: "15F-产品部-工位P08",
        brand: "华硕",
        model: "ROG Strix G15",
        borrower: null,
      },
      {
        id: 9,
        name: "ROUTER009",
        type: "router",
        x: 370,
        y: 380,
        status: "online",
        area: "技术部",
        user: "系统管理",
        location: "15F-技术部-网络机柜",
        brand: "华为",
        model: "AR6300",
        borrower: null,
      },
      {
        id: 10,
        name: "LAPTOP010",
        type: "laptop",
        x: 380,
        y: 420,
        status: "borrowed",
        area: "技术部",
        user: "李建国",
        location: "15F-技术部-工位T05",
        brand: "联想",
        model: "ThinkPad X1 Carbon",
        borrower: "陈晓东",
      },
      {
        id: 11,
        name: "WORKSTATION011",
        type: "workstation",
        x: 480,
        y: 380,
        status: "borrowed",
        area: "运维部",
        user: "王建华",
        location: "15F-运维部-工位O12",
        brand: "戴尔",
        model: "Precision 7000",
        borrower: "刘小华",
      },
      {
        id: 12,
        name: "DRONE008",
        type: "drone",
        x: 580,
        y: 420,
        status: "maintenance",
        area: "测试部",
        user: "维护中",
        location: "15F-测试部-设备柜",
        brand: "大疆",
        model: "Air 2S",
        borrower: null,
      },
      {
        id: 13,
        name: "LAPTOP013",
        type: "laptop",
        x: 100,
        y: 100,
        status: "online",
        area: "研发部",
        user: "李小明",
        location: "15F-研发部-工位R03",
        brand: "华硕",
        model: "ROG Strix G15",
        borrower: null,
      },
      {
        id: 14,
        name: "LAPTOP014",
        type: "laptop",
        x: 180,
        y: 100,
        status: "borrowed",
        area: "研发部",
        user: "王小华",
        location: "15F-研发部-工位R15",
        brand: "戴尔",
        model: "Precision 7000",
        borrower: "张三",
      },
      {
        id: 15,
        name: "TABLET015",
        type: "tablet",
        x: 260,
        y: 140,
        status: "online",
        area: "设计部",
        user: "赵小丽",
        location: "15F-设计部-工位D08",
        brand: "苹果",
        model: "iPad Pro 11",
        borrower: null,
      },
      {
        id: 16,
        name: "CAMERA016",
        type: "camera",
        x: 300,
        y: 120,
        status: "borrowed",
        area: "设计部",
        user: "孙小强",
        location: "15F-设计部-摄影区",
        brand: "索尼",
        model: "A7R5",
        borrower: "李四",
      },
      {
        id: 17,
        name: "ROUTER017",
        type: "router",
        x: 600,
        y: 100,
        status: "online",
        area: "市场部",
        user: "系统管理",
        location: "15F-市场部-网络柜",
        brand: "思科",
        model: "ISR4331",
        borrower: null,
      },
      {
        id: 18,
        name: "LAPTOP018",
        type: "laptop",
        x: 650,
        y: 160,
        status: "borrowed",
        area: "市场部",
        user: "周小芳",
        location: "15F-市场部-工位M08",
        brand: "联想",
        model: "ThinkPad X1",
        borrower: "王五",
      },
      {
        id: 19,
        name: "SERVER019",
        type: "server",
        x: 750,
        y: 100,
        status: "online",
        area: "机房",
        user: "系统管理",
        location: "15F-机房-机柜B01",
        brand: "浪潮",
        model: "NF5280M6",
        borrower: null,
      },
      {
        id: 20,
        name: "SERVER020",
        type: "server",
        x: 850,
        y: 160,
        status: "maintenance",
        area: "机房",
        user: "维护中",
        location: "15F-机房-机柜B05",
        brand: "华为",
        model: "RH2288H V5",
        borrower: null,
      },
      {
        id: 21,
        name: "PRINTER021",
        type: "printer",
        x: 90,
        y: 320,
        status: "online",
        area: "行政部",
        user: "公共设备",
        location: "15F-行政部-打印区",
        brand: "惠普",
        model: "LaserJet Pro",
        borrower: null,
      },
      {
        id: 22,
        name: "LAPTOP022",
        type: "laptop",
        x: 130,
        y: 450,
        status: "borrowed",
        area: "行政部",
        user: "陈小红",
        location: "15F-行政部-工位A05",
        brand: "联想",
        model: "ThinkBook 14",
        borrower: "王五",
      },
      {
        id: 23,
        name: "TABLET023",
        type: "tablet",
        x: 220,
        y: 320,
        status: "online",
        area: "产品部",
        user: "刘小军",
        location: "15F-产品部-工位P03",
        brand: "华为",
        model: "MatePad Pro",
        borrower: null,
      },
      {
        id: 24,
        name: "LAPTOP024",
        type: "laptop",
        x: 280,
        y: 450,
        status: "borrowed",
        area: "产品部",
        user: "杨小梅",
        location: "15F-产品部-工位P12",
        brand: "苹果",
        model: "MacBook Air",
        borrower: "赵六",
      },
      {
        id: 25,
        name: "ROUTER025",
        type: "router",
        x: 360,
        y: 320,
        status: "online",
        area: "技术部",
        user: "系统管理",
        location: "15F-技术部-核心机柜",
        brand: "华为",
        model: "AR6280",
        borrower: null,
      },
      {
        id: 26,
        name: "LAPTOP026",
        type: "laptop",
        x: 390,
        y: 450,
        status: "borrowed",
        area: "技术部",
        user: "马小东",
        location: "15F-技术部-工位T08",
        brand: "戴尔",
        model: "Latitude 7420",
        borrower: "孙七",
      },
      {
        id: 27,
        name: "SERVER027",
        type: "server",
        x: 460,
        y: 320,
        status: "online",
        area: "运维部",
        user: "系统管理",
        location: "15F-运维部-监控中心",
        brand: "浪潮",
        model: "SA5212M5",
        borrower: null,
      },
      {
        id: 28,
        name: "LAPTOP028",
        type: "laptop",
        x: 510,
        y: 450,
        status: "borrowed",
        area: "运维部",
        user: "吴小亮",
        location: "15F-运维部-工位O06",
        brand: "联想",
        model: "ThinkPad P15",
        borrower: "周八",
      },
      {
        id: 29,
        name: "DRONE029",
        type: "drone",
        x: 560,
        y: 320,
        status: "online",
        area: "测试部",
        user: "测试组",
        location: "15F-测试部-飞行区",
        brand: "大疆",
        model: "Mini 3 Pro",
        borrower: null,
      },
      {
        id: 30,
        name: "CAMERA030",
        type: "camera",
        x: 600,
        y: 450,
        status: "borrowed",
        area: "测试部",
        user: "林小峰",
        location: "15F-测试部-工位T03",
        brand: "佳能",
        model: "EOS R6",
        borrower: "李九",
      },
      {
        id: 31,
        name: "LAPTOP031",
        type: "laptop",
        x: 140,
        y: 190,
        status: "borrowed",
        area: "研发部",
        user: "何小波",
        location: "15F-研发部-工位R20",
        brand: "华硕",
        model: "ZenBook Pro",
        borrower: "陈十",
      },
      {
        id: 32,
        name: "PROJECTOR032",
        type: "projector",
        x: 280,
        y: 180,
        status: "online",
        area: "设计部",
        user: "公共设备",
        location: "15F-设计部-会议室",
        brand: "明基",
        model: "TK700STi",
        borrower: null,
      },
      {
        id: 33,
        name: "TABLET033",
        type: "tablet",
        x: 640,
        y: 180,
        status: "borrowed",
        area: "市场部",
        user: "会议设备",
        location: "15F-市场部-会议室",
        brand: "微软",
        model: "Surface Pro 9",
        borrower: "刘十一",
      },
      {
        id: 34,
        name: "LAPTOP034",
        type: "laptop",
        x: 150,
        y: 400,
        status: "online",
        area: "行政部",
        user: "郑小慧",
        location: "15F-行政部-工位A08",
        brand: "惠普",
        model: "EliteBook 840",
        borrower: null,
      },
      {
        id: 35,
        name: "ROUTER035",
        type: "router",
        x: 320,
        y: 400,
        status: "online",
        area: "产品部",
        user: "系统管理",
        location: "15F-产品部-网络间",
        brand: "思科",
        model: "ISR4321",
        borrower: null,
      },
      {
        id: 36,
        name: "LAPTOP036",
        type: "laptop",
        x: 580,
        y: 380,
        status: "maintenance",
        area: "测试部",
        user: "维护中",
        location: "15F-测试部-维修台",
        brand: "戴尔",
        model: "XPS 15",
        borrower: null,
      },
      {
        id: 37,
        name: "LAPTOP037",
        type: "laptop",
        x: 80,
        y: 80,
        status: "online",
        area: "研发部",
        user: "新员工A",
        location: "15F-研发部-工位R21",
        brand: "联想",
        model: "ThinkPad T14",
        borrower: null,
      },
      {
        id: 38,
        name: "TABLET038",
        type: "tablet",
        x: 250,
        y: 80,
        status: "online",
        area: "设计部",
        user: "新员工B",
        location: "15F-设计部-工位D10",
        brand: "苹果",
        model: "iPad Air",
        borrower: null,
      },
      {
        id: 39,
        name: "LAPTOP039",
        type: "laptop",
        x: 600,
        y: 80,
        status: "online",
        area: "市场部",
        user: "新员工C",
        location: "15F-市场部-工位M10",
        brand: "惠普",
        model: "EliteBook 840",
        borrower: null,
      },
      {
        id: 40,
        name: "ROUTER040",
        type: "router",
        x: 350,
        y: 300,
        status: "online",
        area: "技术部",
        user: "系统管理",
        location: "15F-技术部-网络柜2",
        brand: "思科",
        model: "ISR4331",
        borrower: null,
      },
      {
        id: 41,
        name: "CAMERA041",
        type: "camera",
        x: 80,
        y: 300,
        status: "online",
        area: "行政部",
        user: "公共设备",
        location: "15F-行政部-公共区",
        brand: "索尼",
        model: "A7M4",
        borrower: null,
      },
      {
        id: 42,
        name: "LAPTOP042",
        type: "laptop",
        x: 200,
        y: 300,
        status: "online",
        area: "产品部",
        user: "新员工D",
        location: "15F-产品部-工位P15",
        brand: "戴尔",
        model: "XPS 13",
        borrower: null,
      },
    ];

    this.devices = deviceLocations;
    deviceLocations.forEach((device) => {
      this.addRealisticDeviceMarker(device);
    });
  }

  addRealisticDeviceMarker(device) {
    const group = document.createElementNS(this.svgNS, "g");
    group.setAttribute("class", "device-marker");
    group.setAttribute("data-device-id", device.id);

    const iconBg = document.createElementNS(this.svgNS, "circle");
    iconBg.setAttribute("cx", device.x);
    iconBg.setAttribute("cy", device.y);
    iconBg.setAttribute("r", "8");
    iconBg.setAttribute("fill", this.getStatusColor(device.status));
    iconBg.setAttribute("stroke", "#fff");
    iconBg.setAttribute("stroke-width", "2");
    iconBg.setAttribute("filter", "url(#buildingShadow)");
    group.appendChild(iconBg);

    const icon = document.createElementNS(this.svgNS, "text");
    icon.setAttribute("x", device.x);
    icon.setAttribute("y", device.y + 2);
    icon.setAttribute("text-anchor", "middle");
    icon.setAttribute("font-size", "8");
    icon.setAttribute("fill", "#fff");
    icon.textContent = this.getDeviceIcon(device.type);
    group.appendChild(icon);

    const labelBg = document.createElementNS(this.svgNS, "rect");
    labelBg.setAttribute("x", device.x - 20);
    labelBg.setAttribute("y", device.y + 12);
    labelBg.setAttribute("width", "40");
    labelBg.setAttribute("height", "12");
    labelBg.setAttribute("fill", "rgba(255,255,255,0.95)");
    labelBg.setAttribute("stroke", "#ddd");
    labelBg.setAttribute("stroke-width", "1");
    labelBg.setAttribute("rx", "6");
    group.appendChild(labelBg);

    const label = document.createElementNS(this.svgNS, "text");
    label.setAttribute("x", device.x);
    label.setAttribute("y", device.y + 20);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "6");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("fill", "#2c3e50");
    label.textContent = device.name;
    group.appendChild(label);

    group.style.cursor = "pointer";
    group.addEventListener("click", () => {
      this.showDeviceDetails(device);
    });

    group.addEventListener("mouseenter", () => {
      iconBg.setAttribute("r", "10"); // 从12px调整到10px
      iconBg.setAttribute("stroke-width", "3");
      labelBg.setAttribute("fill", "rgba(255,255,255,1)");
    });

    group.addEventListener("mouseleave", () => {
      iconBg.setAttribute("r", "8"); // 从10px调整到8px
      iconBg.setAttribute("stroke-width", "2");
      labelBg.setAttribute("fill", "rgba(255,255,255,0.95)");
    });

    this.svg.appendChild(group);
  }

  getStatusColor(status) {
    const colors = {
      online: "#27ae60",
      borrowed: "#f39c12",
      maintenance: "#e74c3c",
      offline: "#95a5a6",
    };
    return colors[status] || colors.online;
  }

  getDeviceIcon(type) {
    const icons = {
      laptop: "💻",
      workstation: "🖥️",
      server: "🖥️",
      drone: "🚁",
      tablet: "📱",
      camera: "📷",
      router: "📡",
      projector: "📽️",
      printer: "🖨️",
    };
    return icons[type] || "📦";
  }

  // 电子围栏判定
  isInFence(device) {
    const fences = {
      研发部: { x: 55, y: 55, width: 160, height: 160 },
      设计部: { x: 220, y: 55, width: 130, height: 160 },
      市场部: { x: 570, y: 55, width: 130, height: 160 },
      机房: { x: 705, y: 55, width: 190, height: 160 },
      行政部: { x: 55, y: 265, width: 120, height: 250 },
      产品部: { x: 180, y: 265, width: 140, height: 250 },
      技术部: { x: 325, y: 265, width: 100, height: 250 },
      运维部: { x: 430, y: 265, width: 100, height: 250 },
      测试部: { x: 535, y: 265, width: 100, height: 250 },
    };

    const fence = fences[device.area];
    if (!fence) return true;

    return (
      device.x >= fence.x &&
      device.x <= fence.x + fence.width &&
      device.y >= fence.y &&
      device.y <= fence.y + fence.height
    );
  }

  addLegendAndScale() {
    const legend = document.createElement("div");
    legend.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(255,255,255,0.95);
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-size: 12px;
            min-width: 150px;
        `;

    legend.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: #2c3e50;">
                <i class="fas fa-info-circle"></i> 设备状态图例
            </div>
            <div style="display: flex; align-items: center; margin: 4px 0;">
                <div style="width: 12px; height: 12px; background: #27ae60; border-radius: 50%; margin-right: 8px;"></div>
                <span>在线设备</span>
            </div>
            <div style="display: flex; align-items: center; margin: 4px 0;">
                <div style="width: 12px; height: 12px; background: #f39c12; border-radius: 50%; margin-right: 8px;"></div>
                <span>借用中</span>
            </div>
            <div style="display: flex; align-items: center; margin: 4px 0;">
                <div style="width: 12px; height: 12px; background: #e74c3c; border-radius: 50%; margin-right: 8px;"></div>
                <span>维护中</span>
            </div>
            <div style="display: flex; align-items: center; margin: 4px 0;">
                <div style="width: 12px; height: 12px; background: #95a5a6; border-radius: 50%; margin-right: 8px;"></div>
                <span>离线</span>
            </div>
        `;

    this.container.appendChild(legend);

    const scale = document.createElement("div");
    scale.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(255,255,255,0.95);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-size: 11px;
            color: #7f8c8d;
        `;

    scale.innerHTML = `
            <div style="margin-bottom: 5px;">比例尺 1:150</div>
            <div style="display: flex; align-items: center;">
                <div style="width: 40px; height: 2px; background: #34495e; margin-right: 5px;"></div>
                <span>8米</span>
            </div>
        `;

    this.container.appendChild(scale);
  }

  showDeviceDetails(device) {
    const modal = document.createElement("div");
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

    const content = document.createElement("div");
    content.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 90%;
        `;

    const deviceTypeNames = {
      laptop: "笔记本电脑",
      workstation: "工作站",
      server: "服务器",
      drone: "无人机",
      tablet: "平板电脑",
      camera: "摄影设备",
      router: "路由器",
      projector: "投影仪",
    };

    content.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="font-size: 24px; margin-right: 10px;">${this.getDeviceIcon(
                  device.type
                )}</div>
                <div>
                    <h3 style="margin: 0; color: #2c3e50;">${device.name}</h3>
                    <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px;">${
                      deviceTypeNames[device.type] || device.type
                    }</p>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>设备品牌:</span>
                    <span style="font-weight: bold;">${
                      device.brand || "未知"
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>设备型号:</span>
                    <span style="font-weight: bold;">${
                      device.model || "未知"
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>当前位置:</span>
                    <span style="font-weight: bold;">${
                      device.location || device.area
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>使用人员:</span>
                    <span style="font-weight: bold;">${
                      device.user || "未分配"
                    }</span>
                </div>
                ${
                  device.borrower
                    ? `<div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>借用人:</span>
                    <span style="font-weight: bold; color: #f39c12;">${device.borrower}</span>
                </div>`
                    : ""
                }
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>设备状态:</span>
                    <span style="color: ${this.getStatusColor(
                      device.status
                    )}; font-weight: bold;">
                        ${
                          device.status === "online"
                            ? "在线"
                            : device.status === "borrowed"
                            ? "借用中"
                            : device.status === "maintenance"
                            ? "维护中"
                            : "离线"
                        }
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>星闪信号:</span>
                    <span>-${Math.floor(Math.random() * 20 + 30)}dBm (${
      Math.random() > 0.3 ? "优秀" : "良好"
    })</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>定位精度:</span>
                    <span>±${Math.floor(Math.random() * 20 + 10)}cm</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>最后更新:</span>
                    <span>${Math.floor(Math.random() * 5 + 1)}分钟前</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>电子围栏:</span>
                    <span style="color: ${
                      this.isInFence(device) ? "#27ae60" : "#e74c3c"
                    };">
                        ${this.isInFence(device) ? "正常范围" : "超出范围"}
                    </span>
                </div>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button onclick="locateAsset(${device.id})" 
                        style="flex: 1; padding: 8px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    定位设备
                </button>
                <button onclick="showTrajectory(${device.id})" 
                        style="flex: 1; padding: 8px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    查看轨迹
                </button>
                <button onclick="setElectronicFence(${device.id})" 
                        style="flex: 1; padding: 8px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: font-size: 12px;">
                    设置围栏
                </button>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="width: 100%; padding: 10px; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                关闭
            </button>
        `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  highlightDevice(deviceId) {
    alert(`highlightDevice called with id: ${deviceId}`);
    const marker = this.svg.querySelector(`[data-device-id='${deviceId}']`);
    alert('marker found: ' + marker);
    if (!marker) return;

    const circle = marker.querySelector("circle");
    const cx = circle.getAttribute("cx");
    const cy = circle.getAttribute("cy");

    const highlightCircle = document.createElementNS(this.svgNS, "circle");
    highlightCircle.setAttribute("cx", cx);
    highlightCircle.setAttribute("cy", cy);
    highlightCircle.setAttribute("r", "15");
    highlightCircle.setAttribute("fill", "none");
    highlightCircle.setAttribute("stroke", "red");
    highlightCircle.setAttribute("stroke-width", "3");

    this.svg.appendChild(highlightCircle);

    setTimeout(() => {
        highlightCircle.remove();
    }, 2000);
  }

  showTrajectory(deviceId) {
    const device = this.devices.find(d => d.id === deviceId);
    if (!device) return;

    const modal = document.createElement("div");
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

    const content = document.createElement("div");
    content.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 800px;
            width: 90%;
        `;

    const trajectoryData = [
        { x: 100, y: 150, time: "09:15" },
        { x: 300, y: 200, time: "11:20" },
        { x: 120, y: 120, time: "14:30" },
        { x: 150, y: 150, time: "昨天 17:45" },
    ];

    const locationRecords = `
        <h4>最近位置记录：</h4>
        <ul>
            <li>14:30 - 研发部-A区-工位12</li>
            <li>11:20 - 会议室-201</li>
            <li>09:15 - 研发部-A区-工位12</li>
            <li>昨天 17:45 - 研发部-A区-工位12</li>
        </ul>
    `;

    const mapClone = this.svg.cloneNode(true);
    mapClone.removeAttribute("width");
    mapClone.removeAttribute("height");
    mapClone.style.width = "100%";
    mapClone.style.height = "300px";

    const xCoords = trajectoryData.map(p => p.x);
    const yCoords = trajectoryData.map(p => p.y);
    const minX = Math.min(...xCoords) - 50;
    const minY = Math.min(...yCoords) - 50;
    const maxX = Math.max(...xCoords) + 50;
    const maxY = Math.max(...yCoords) + 50;
    const viewBoxWidth = maxX - minX;
    const viewBoxHeight = maxY - minY;

    mapClone.setAttribute("viewBox", `${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`);

    const trajectoryPath = trajectoryData.map(p => `${p.x},${p.y}`).join("L");
    const path = document.createElementNS(this.svgNS, "path");
    path.setAttribute("d", `M${trajectoryPath}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#e74c3c");
    path.setAttribute("stroke-width", "4");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    mapClone.appendChild(path);

    trajectoryData.forEach(p => {
        const point = document.createElementNS(this.svgNS, "circle");
        point.setAttribute("cx", p.x);
        point.setAttribute("cy", p.y);
        point.setAttribute("r", "6");
        point.setAttribute("fill", "#e74c3c");
        const title = document.createElementNS(this.svgNS, "title");
        title.textContent = p.time;
        point.appendChild(title);
        mapClone.appendChild(point);
    });

    const mapContainer = document.createElement("div");
    mapContainer.appendChild(mapClone);

    content.innerHTML = `
            <h3>${device.name} 的轨迹</h3>
            <div style="display:flex; margin-top: 20px;">
                <div style="flex:2; padding-right: 20px; border-right: 1px solid #eee;">
                    <h5>轨迹图</h5>
                    ${mapContainer.innerHTML}
                </div>
                <div style="flex:1; padding-left: 20px;">
                    ${locationRecords}
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="width: 100%; padding: 10px; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-top: 20px;">关闭</button>
        `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

let officeMap; // Make map instance globally accessible

// 初始化真实写字楼地图的函数
function initIndoorMap() {
  const mapContainer = document.getElementById("indoor-map-container");
  if (mapContainer) {
    officeMap = new RealisticOfficeFloorPlan("indoor-map-container");
  }
}

