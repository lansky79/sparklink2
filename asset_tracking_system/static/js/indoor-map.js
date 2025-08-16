// 真实写字楼平面图 - 更大面积，更小虚线间距
class RealisticOfficeFloorPlan {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.width = 1000;
    this.height = 600;
    this.devices = [];
    this.init();
  }

  init() {
    // 创建主容器样式
    this.container.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            position: relative;
        `;

    // 创建地图标题
    const title = document.createElement("div");
    title.style.cssText = `
            color: white;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            text-align: center;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
    title.innerHTML =
      '<i class="fas fa-building"></i> 智能科技大厦 - 15F 办公楼层平面图';
    this.container.appendChild(title);

    // 创建地图容器
    const mapWrapper = document.createElement("div");
    mapWrapper.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            position: relative;
        `;
    this.container.appendChild(mapWrapper);

    // 创建SVG地图
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", this.height);
    this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
    this.svg.style.backgroundColor = "#f8f9fa";
    this.svg.style.borderRadius = "6px";
    this.svg.style.border = "1px solid #e9ecef";

    mapWrapper.appendChild(this.svg);

    // 添加渐变和阴影定义
    this.addDefinitions();

    // 绘制真实写字楼平面图
    this.drawRealisticOfficeLayout();

    // 加载设备位置
    this.loadDeviceLocations();

    // 添加图例和比例尺
    this.addLegendAndScale();
  }

  addDefinitions() {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // 办公区域渐变
    const officeGradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    officeGradient.setAttribute("id", "officeGradient");
    officeGradient.setAttribute("x1", "0%");
    officeGradient.setAttribute("y1", "0%");
    officeGradient.setAttribute("x2", "100%");
    officeGradient.setAttribute("y2", "100%");

    const stop1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#f8f9fa");

    const stop2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#e9ecef");

    officeGradient.appendChild(stop1);
    officeGradient.appendChild(stop2);
    defs.appendChild(officeGradient);

    // 公共区域渐变（灰色）
    const publicGradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    publicGradient.setAttribute("id", "publicGradient");
    publicGradient.setAttribute("x1", "0%");
    publicGradient.setAttribute("y1", "0%");
    publicGradient.setAttribute("x2", "100%");
    publicGradient.setAttribute("y2", "100%");

    const grayStop1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    grayStop1.setAttribute("offset", "0%");
    grayStop1.setAttribute("stop-color", "#d5dbdb");

    const grayStop2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    grayStop2.setAttribute("offset", "100%");
    grayStop2.setAttribute("stop-color", "#bdc3c7");

    publicGradient.appendChild(grayStop1);
    publicGradient.appendChild(grayStop2);
    defs.appendChild(publicGradient);

    // 阴影滤镜
    const filter = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "filter"
    );
    filter.setAttribute("id", "buildingShadow");
    filter.setAttribute("x", "-20%");
    filter.setAttribute("y", "-20%");
    filter.setAttribute("width", "140%");
    filter.setAttribute("height", "140%");

    const shadow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feDropShadow"
    );
    shadow.setAttribute("dx", "3");
    shadow.setAttribute("dy", "3");
    shadow.setAttribute("stdDeviation", "4");
    shadow.setAttribute("flood-color", "rgba(0,0,0,0.15)");

    filter.appendChild(shadow);
    defs.appendChild(filter);

    this.svg.appendChild(defs);
  }

  drawRealisticOfficeLayout() {
    // 绘制建筑外轮廓
    this.drawBuildingOutline();

    // 绘制公共区域（电梯、楼梯、卫生间）
    this.drawPublicAreas();

    // 绘制完全连通的办公区域
    this.drawConnectedOfficeAreas();

    // 绘制建筑细节
    this.drawBuildingDetails();
  }

  drawBuildingOutline() {
    // L型写字楼外轮廓 - 更大面积
    const buildingPath = `
            M 50 50 
            L 900 50 
            L 900 300 
            L 750 300 
            L 750 520 
            L 50 520 
            Z
        `;

    const building = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    building.setAttribute("d", buildingPath);
    building.setAttribute("fill", "url(#officeGradient)");
    building.setAttribute("stroke", "#2c3e50");
    building.setAttribute("stroke-width", "3");
    building.setAttribute("filter", "url(#buildingShadow)");
    this.svg.appendChild(building);

    // 建筑名称
    const buildingName = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    buildingName.setAttribute("x", "475");
    buildingName.setAttribute("y", "30");
    buildingName.setAttribute("text-anchor", "middle");
    buildingName.setAttribute("font-size", "16");
    buildingName.setAttribute("font-weight", "bold");
    buildingName.setAttribute("fill", "#2c3e50");
    buildingName.textContent = "智能科技大厦 15F";
    this.svg.appendChild(buildingName);
  }

  drawPublicAreas() {
    // 电梯井（公共区域）- 在过道中央位置
    const elevatorShaft = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    elevatorShaft.setAttribute("x", "420");
    elevatorShaft.setAttribute("y", "225");
    elevatorShaft.setAttribute("width", "50");
    elevatorShaft.setAttribute("height", "30");
    elevatorShaft.setAttribute("fill", "url(#publicGradient)");
    elevatorShaft.setAttribute("stroke", "#7f8c8d");
    elevatorShaft.setAttribute("stroke-width", "2");
    elevatorShaft.setAttribute("rx", "4");
    this.svg.appendChild(elevatorShaft);

    const elevatorText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    elevatorText.setAttribute("x", "445");
    elevatorText.setAttribute("y", "235");
    elevatorText.setAttribute("text-anchor", "middle");
    elevatorText.setAttribute("font-size", "8");
    elevatorText.setAttribute("font-weight", "bold");
    elevatorText.setAttribute("fill", "#34495e");
    elevatorText.textContent = "🛗";
    this.svg.appendChild(elevatorText);

    const elevatorLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    elevatorLabel.setAttribute("x", "445");
    elevatorLabel.setAttribute("y", "248");
    elevatorLabel.setAttribute("text-anchor", "middle");
    elevatorLabel.setAttribute("font-size", "7");
    elevatorLabel.setAttribute("fill", "#34495e");
    elevatorLabel.textContent = "电梯";
    this.svg.appendChild(elevatorLabel);

    // 楼梯间（公共区域）
    const staircase = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    staircase.setAttribute("x", "480");
    staircase.setAttribute("y", "225");
    staircase.setAttribute("width", "50");
    staircase.setAttribute("height", "30");
    staircase.setAttribute("fill", "url(#publicGradient)");
    staircase.setAttribute("stroke", "#7f8c8d");
    staircase.setAttribute("stroke-width", "2");
    staircase.setAttribute("rx", "4");
    this.svg.appendChild(staircase);

    // 绘制梯子图标
    this.drawLadderIcon(505, 240);

    const stairLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    stairLabel.setAttribute("x", "505");
    stairLabel.setAttribute("y", "248");
    stairLabel.setAttribute("text-anchor", "middle");
    stairLabel.setAttribute("font-size", "7");
    stairLabel.setAttribute("fill", "#34495e");
    stairLabel.textContent = "楼梯";
    this.svg.appendChild(stairLabel);

    // 卫生间（公共区域）
    const restroom = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    restroom.setAttribute("x", "360");
    restroom.setAttribute("y", "225");
    restroom.setAttribute("width", "50");
    restroom.setAttribute("height", "30");
    restroom.setAttribute("fill", "url(#publicGradient)");
    restroom.setAttribute("stroke", "#7f8c8d");
    restroom.setAttribute("stroke-width", "2");
    restroom.setAttribute("rx", "4");
    this.svg.appendChild(restroom);

    const restroomIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    restroomIcon.setAttribute("x", "385");
    restroomIcon.setAttribute("y", "235");
    restroomIcon.setAttribute("text-anchor", "middle");
    restroomIcon.setAttribute("font-size", "8");
    restroomIcon.textContent = "🚻";
    this.svg.appendChild(restroomIcon);

    const restroomLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    restroomLabel.setAttribute("x", "385");
    restroomLabel.setAttribute("y", "248");
    restroomLabel.setAttribute("text-anchor", "middle");
    restroomLabel.setAttribute("font-size", "7");
    restroomLabel.setAttribute("fill", "#34495e");
    restroomLabel.textContent = "卫生间";
    this.svg.appendChild(restroomLabel);
  }

  drawLadderIcon(x, y) {
    const ladder = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // 梯子左边
    const ladderLeft = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    ladderLeft.setAttribute("x1", x - 10);
    ladderLeft.setAttribute("y1", y - 10);
    ladderLeft.setAttribute("x2", x - 10);
    ladderLeft.setAttribute("y2", y + 10);
    ladderLeft.setAttribute("stroke", "#34495e");
    ladderLeft.setAttribute("stroke-width", "2");
    ladder.appendChild(ladderLeft);

    // 梯子右边
    const ladderRight = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    ladderRight.setAttribute("x1", x + 10);
    ladderRight.setAttribute("y1", y - 10);
    ladderRight.setAttribute("x2", x + 10);
    ladderRight.setAttribute("y2", y + 10);
    ladderRight.setAttribute("stroke", "#34495e");
    ladderRight.setAttribute("stroke-width", "2");
    ladder.appendChild(ladderRight);

    // 梯子横档
    for (let i = 0; i < 4; i++) {
      const rung = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
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
    // 绘制主过道 - 连接所有办公区域
    this.drawMainCorridor();

    // 办公区域紧贴墙体，过道合理分割上下两部分
    const officeAreas = [
      // 上半部分办公区域 - 紧贴上边缘
      { name: "研发部", x: 55, y: 55, width: 160, height: 160, icon: "💻" },
      { name: "设计部", x: 220, y: 55, width: 130, height: 160, icon: "🎨" },
      { name: "市场部", x: 570, y: 55, width: 130, height: 160, icon: "📊" },
      { name: "机房", x: 705, y: 55, width: 190, height: 160, icon: "🖥️" },

      // 下半部分办公区域 - 紧贴下边缘
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
      // 根据区域类型设置不同的背景色
      const fillColor = area.type === "corridor" ? "#ecf0f1" : "#e3f2fd";
      const strokeColor = area.type === "corridor" ? "#bdc3c7" : "#1976d2";
      const textColor = area.type === "corridor" ? "#7f8c8d" : "#1565c0";

      // 办公区域背景填充
      const areaBackground = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      areaBackground.setAttribute("x", area.x);
      areaBackground.setAttribute("y", area.y);
      areaBackground.setAttribute("width", area.width);
      areaBackground.setAttribute("height", area.height);
      areaBackground.setAttribute("fill", fillColor);
      areaBackground.setAttribute("opacity", "0.6");
      this.svg.appendChild(areaBackground);

      // 边框分隔区域
      const areaBorder = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
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

      // 区域标签
      const areaLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      areaLabel.setAttribute("x", area.x + 10);
      areaLabel.setAttribute("y", area.y + 20);
      areaLabel.setAttribute("font-size", "12");
      areaLabel.setAttribute("font-weight", "bold");
      areaLabel.setAttribute("fill", textColor);
      areaLabel.textContent = `${area.icon} ${area.name}`;
      this.svg.appendChild(areaLabel);
    });

    // 在右下角缺角部分添加楼梯间
    this.drawCornerStaircase();
  }

  drawMainCorridor() {
    // 绘制主过道 - 水平过道，将楼层分为上下两部分
    const horizontalCorridor = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    horizontalCorridor.setAttribute("x", "55");
    horizontalCorridor.setAttribute("y", "220");
    horizontalCorridor.setAttribute("width", "840");
    horizontalCorridor.setAttribute("height", "40");
    horizontalCorridor.setAttribute("fill", "#ecf0f1");
    horizontalCorridor.setAttribute("stroke", "#bdc3c7");
    horizontalCorridor.setAttribute("stroke-width", "1");
    this.svg.appendChild(horizontalCorridor);

    // 主入口连接区域 - 连接到主过道
    const entranceArea = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    entranceArea.setAttribute("x", "355");
    entranceArea.setAttribute("y", "55");
    entranceArea.setAttribute("width", "210");
    entranceArea.setAttribute("height", "160");
    entranceArea.setAttribute("fill", "#ecf0f1");
    entranceArea.setAttribute("stroke", "#bdc3c7");
    entranceArea.setAttribute("stroke-width", "1");
    this.svg.appendChild(entranceArea);

    // 过道标识
    const corridorText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    corridorText.setAttribute("x", "475");
    corridorText.setAttribute("y", "245");
    corridorText.setAttribute("text-anchor", "middle");
    corridorText.setAttribute("font-size", "10");
    corridorText.setAttribute("fill", "#7f8c8d");
    corridorText.textContent = "主过道";
    this.svg.appendChild(corridorText);
  }

  drawCornerStaircase() {
    // 在右下角缺角部分绘制楼梯间 - 占满整个方框
    const cornerStaircase = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    cornerStaircase.setAttribute("x", "750");
    cornerStaircase.setAttribute("y", "265");
    cornerStaircase.setAttribute("width", "145");
    cornerStaircase.setAttribute("height", "250");
    cornerStaircase.setAttribute("fill", "url(#publicGradient)");
    cornerStaircase.setAttribute("stroke", "#7f8c8d");
    cornerStaircase.setAttribute("stroke-width", "2");
    cornerStaircase.setAttribute("rx", "4");
    this.svg.appendChild(cornerStaircase);

    // 绘制大的楼梯图标
    this.drawLadderIcon(822, 390);
  }

  drawBuildingDetails() {
    // 窗户（外墙蓝色线条）
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
      const windowLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      windowLine.setAttribute("x1", window.x1);
      windowLine.setAttribute("y1", window.y1);
      windowLine.setAttribute("x2", window.x2);
      windowLine.setAttribute("y2", window.y2);
      windowLine.setAttribute("stroke", "#3498db");
      windowLine.setAttribute("stroke-width", "4");
      windowLine.setAttribute("opacity", "0.8");
      this.svg.appendChild(windowLine);
    });

    // 主入口 - 简化为红色标记线
    const entrance = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    entrance.setAttribute("x", "465");
    entrance.setAttribute("y", "47");
    entrance.setAttribute("width", "40");
    entrance.setAttribute("height", "6");
    entrance.setAttribute("fill", "#e74c3c");
    this.svg.appendChild(entrance);
  }

  loadDeviceLocations() {
    // 真实的设备位置分布 - 根据新布局调整坐标
    const deviceLocations = [
      // 上半部分设备
      {
        id: 1,
        name: "LAPTOP001",
        type: "laptop",
        x: 120,
        y: 130,
        status: "online",
        area: "研发部",
        user: "陈志华",
        location: "研发部-工位R12",
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
        location: "设计部-工位D05",
        brand: "戴尔",
        model: "Precision 7560",
        borrower: "王建国",
      },
      {
        id: 3,
        name: "SERVER003",
        type: "server",
        x: 800,
        y: 130,
        status: "online",
        area: "机房",
        user: "系统管理",
        location: "机房-机柜A15",
        brand: "华为",
        model: "FusionServer 2288H V5",
        borrower: null,
      },
      {
        id: 4,
        name: "WORKSTATION007",
        type: "workstation",
        x: 160,
        y: 150,
        status: "borrowed",
        area: "研发部",
        user: "胡建军",
        location: "研发部-工位R08",
        brand: "惠普",
        model: "ZBook Fury 17 G8",
        borrower: "李明华",
      },
      {
        id: 5,
        name: "SERVER006",
        type: "server",
        x: 850,
        y: 150,
        status: "online",
        area: "机房",
        user: "系统管理",
        location: "机房-存储区",
        brand: "戴尔",
        model: "PowerVault ME4012",
        borrower: null,
      },
      {
        id: 6,
        name: "LAPTOP005",
        type: "laptop",
        x: 620,
        y: 130,
        status: "online",
        area: "市场部",
        user: "孙丽娟",
        location: "市场部-工位M03",
        brand: "苹果",
        model: 'MacBook Pro 16"',
        borrower: null,
      },

      // 下半部分设备
      {
        id: 7,
        name: "CAMERA013",
        type: "camera",
        x: 110,
        y: 380,
        status: "borrowed",
        area: "行政部",
        user: "赵雅琴",
        location: "行政部-会议室",
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
        location: "产品部-工位P08",
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
        location: "技术部-网络机柜",
        brand: "华为",
        model: "AR6300",
        borrower: null,
      },
      {
        id: 10,
        name: "LAPTOP010",
        type: "laptop",
        x: 350,
        y: 420,
        status: "borrowed",
        area: "技术部",
        user: "李建国",
        location: "技术部-工位T05",
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
        status: "online",
        area: "运维部",
        user: "王建华",
        location: "运维部-工位O12",
        brand: "戴尔",
        model: "Precision 7000",
        borrower: null,
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
        location: "测试部-设备柜",
        brand: "大疆",
        model: "Air 2S",
        borrower: null,
      },
    ];

    deviceLocations.forEach((device) => {
      this.addRealisticDeviceMarker(device);
    });
  }

  addRealisticDeviceMarker(device) {
    // 创建设备标记组
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "device-marker");
    group.setAttribute("data-device-id", device.id);

    // 设备位置指示器（静态圆圈，不闪烁）
    const pulseCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    pulseCircle.setAttribute("cx", device.x);
    pulseCircle.setAttribute("cy", device.y);
    pulseCircle.setAttribute("r", "15");
    pulseCircle.setAttribute("fill", "none");
    pulseCircle.setAttribute("stroke", this.getStatusColor(device.status));
    pulseCircle.setAttribute("stroke-width", "2");
    pulseCircle.setAttribute("opacity", "0.4");
    pulseCircle.setAttribute("class", "device-pulse-circle");

    group.appendChild(pulseCircle);

    // 设备图标背景
    const iconBg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    iconBg.setAttribute("cx", device.x);
    iconBg.setAttribute("cy", device.y);
    iconBg.setAttribute("r", "10");
    iconBg.setAttribute("fill", this.getStatusColor(device.status));
    iconBg.setAttribute("stroke", "#fff");
    iconBg.setAttribute("stroke-width", "2");
    iconBg.setAttribute("filter", "url(#buildingShadow)");
    group.appendChild(iconBg);

    // 设备图标
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "text");
    icon.setAttribute("x", device.x);
    icon.setAttribute("y", device.y + 3);
    icon.setAttribute("text-anchor", "middle");
    icon.setAttribute("font-size", "10");
    icon.setAttribute("fill", "#fff");
    icon.textContent = this.getDeviceIcon(device.type);
    group.appendChild(icon);

    // 设备标签背景
    const labelBg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    labelBg.setAttribute("x", device.x - 25);
    labelBg.setAttribute("y", device.y + 15);
    labelBg.setAttribute("width", "50");
    labelBg.setAttribute("height", "14");
    labelBg.setAttribute("fill", "rgba(255,255,255,0.95)");
    labelBg.setAttribute("stroke", "#ddd");
    labelBg.setAttribute("stroke-width", "1");
    labelBg.setAttribute("rx", "7");
    group.appendChild(labelBg);

    // 设备名称标签
    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    label.setAttribute("x", device.x);
    label.setAttribute("y", device.y + 24);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "7");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("fill", "#2c3e50");
    label.textContent = device.name;
    group.appendChild(label);

    // 添加交互效果
    group.style.cursor = "pointer";
    group.addEventListener("click", () => {
      this.showDeviceDetails(device);
    });

    group.addEventListener("mouseenter", () => {
      iconBg.setAttribute("r", "12");
      iconBg.setAttribute("stroke-width", "3");
      labelBg.setAttribute("fill", "rgba(255,255,255,1)");
    });

    group.addEventListener("mouseleave", () => {
      iconBg.setAttribute("r", "10");
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
    };
    return icons[type] || "📦";
  }

  // 检查设备是否在电子围栏内
  isInFence(device) {
    // 定义各区域的电子围栏范围
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
    // 图例
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

    // 比例尺
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
    // 创建设备详情弹窗
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
                <button onclick="highlightDevice(${device.id})" 
                        style="flex: 1; padding: 8px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    定位设备
                </button>
                <button onclick="showDeviceTrajectory(${device.id})" 
                        style="flex: 1; padding: 8px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    查看轨迹
                </button>
                <button onclick="setElectronicFence(${device.id})" 
                        style="flex: 1; padding: 8px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
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

    // 点击背景关闭
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

// 初始化真实写字楼地图的函数
function initIndoorMap() {
  const mapContainer = document.getElementById("indoor-map-container");
  if (mapContainer) {
    new RealisticOfficeFloorPlan("indoor-map-container");
  }
}
