class PrjPoint{
    constructor(){
        this.m_OriginLongitude; // 中央子午线经度
		this.m_Lo; // 经纬度坐标
        this.m_La; 
		this.x; // 高斯投影平面坐标
        this.y; 
		this.m_ZoneNum;//工作区带号
		this.m_ParaDegree = 6;//分段度数
		this.m_CoordSysType = 0;//标准类型(0为克鲁索夫斯基标准，1为国家UGG1975标准,2为WGS84椭球体)
        
        // 基本椭球参数,a长半径,b短半径,n=(a-b)/(a+b),f扁率,e2第一偏心率平方,e12第二偏心率平方
        this.a = 6378245; 
        this.b = 6356863.01880;
        this.n = (this.a - this.b) / (this.a + this.b);
        this.f = this.a / (this.a - this.b);
        this.e2 = 1 - ((this.f - 1) / this.f) * ((this.f - 1) / this.f);
        this.e12 = (this.f / (this.f - 1)) * (this.f / (this.f - 1)) - 1;
		
        this.A1 = this.a * (1 - this.n + (Math.pow(this.n, 2) - Math.pow(this.n, 3)) * 5 / 4 +(Math.pow(this.n, 4) - Math.pow(this.n, 5))*81/64)*Math.PI/180; // 用于计算X的椭球参数
        this.A2 = (this.n - Math.pow(this.n, 2) + (Math.pow(this.n, 3) -Math.pow(this.n, 4)) * 7 / 8 + Math.pow(this.n, 5) * 55 / 64) * 3 * this.a / 2;
        this.A3 = (Math.pow(this.n, 2) - Math.pow(this.n, 3)+(Math.pow(this.n, 4) - Math.pow(this.n, 5)) * 3 / 4) * 15 * this.a / 16;
        this.A4 = (Math.pow(this.n, 3) -Math.pow(this.n, 4) + Math.pow(this.n, 5) * 11 / 16) * 35 * this.a / 48; 
        this.SetZoneNum(21);
        
    }
    
    LoLaToxy(){
        var X, N, t, t2, m, m2, ng2, sinB, cosB;
        
        X = this.A1 * this.m_Lo * 180.0 / Math.PI + this.A2 * Math.sin(2 * this.m_Lo) + this.A3 * Math.sin(4 * this.m_Lo) + this.A4 * Math.sin(6 * this.m_Lo);
        sinB = Math.sin(this.m_Lo);
	    cosB = Math.cos(this.m_Lo);
	    t = Math.tan(this.m_Lo);
        t2 = t * t;
        N = this.a / Math.sqrt(1 - this.e2 * sinB * sinB);
        m = cosB * (this.m_La - this.m_OriginLongitude);
	    m2 = m * m;
	    ng2 = cosB * cosB * this.e2 / (1 - this.e2);
        this.x = X + N * t * ((0.5 + ((5 - t2 + 9 * ng2 + 4 * ng2 * ng2) / 24.0 + (61 -58 * t2 + t2 * t2) * m2 / 720.0) * m2) * m2);
	    this.y = N * m * ( 1 + m2 * ( (1 - t2 + ng2) / 6.0 + m2 * ( 5 - 18 * t2 + t2 * t2 + 14 * ng2 - 58 * ng2 * t2 ) / 120.0));
	    this.y += 500000;
        return true;     
        
        
    }
    
    xyToLoLa(){
        var sinB, cosB, t, t2, N ,ng2, V, yN;
	    var preB0, B0;
	    var eta;
		var dy = this.y;
        
		dy -= 500000;
		B0 = this.x / this.A1;
        do
		{
			preB0 = B0;
			B0 = B0 * Math.PI / 180.0;
			B0 = (this.x - (this.A2 * Math.sin(2 * B0) + this.A3 * Math.sin(4 * B0) + this.A4 * Math.sin(6 * B0))) / this.A1;
			eta = Math.abs(B0 - preB0);
		}while(eta > 0.000000001);
        
        B0 = B0 * Math.PI / 180.0;
		this.m_Lo = Rad2Dms(B0);
		sinB = Math.sin(B0);
		cosB = Math.cos(B0);
		t = Math.tan(B0);
		t2 = t * t;
		N = a / Math.sqrt(1 - this.e2 * sinB * sinB);
		ng2 = cosB * cosB * this.e2 / (1 - this.e2);
		V = Math.sqrt(1 + ng2);
		yN = dy / N;
        
        m_Lo = B0 - (yN * yN - (5 + 3 * t2 + ng2 - 9 * ng2 * t2) * yN * yN * yN * yN /
	12.0 + (61 + 90 * t2 + 45 * t2 * t2) * yN * yN * yN * yN * yN * yN / 360.0)
	* V * V * t / 2;
		m_La = this.m_OriginLongitude + (yN - (1 + 2 * t2 + ng2) * yN * yN * yN / 6.0 + (5 + 28 * t2 + 24 
	* t2 * t2 + 6 * ng2 + 8 * ng2 * t2) * yN * yN * yN * yN * yN / 120.0) / cosB
	;
        return true;
        
    }
	
	SetCoordSysType(type){
		if((type < 0) || (type > 1)){
			alert("类型错误，0为克鲁索夫斯椭球体，1为国家UGG1975椭球体,2为WGS84椭球体");
			return false;
		}else{
			this.m_CoordSysType = type;
			if(type==0)
			{
				this.a = 6378245;
				this.b = 6356863.01880;
			}else if(type==1){
				this.a = 6378140;
				this.b = 6356755.28820;
			}else if(type==2){
				this.a = 6378137.000;
				this.b = 6356752.31420;	
			}
			
			this.f = this.a / (this.a - this.b);
			this.e2 = 1 - ((this.f - 1) / this.f) * ((this.f - 1) / this.f);
			this.e12 = (this.f / (this.f - 1)) * (this.f / (this.f - 1)) - 1;
			this.n=(this.a - this.b) / (this.a + this.b);
			this.A1 = this.a * (1-this.n +(Math.pow(this.n, 2) - Math.pow(this.n, 3)) * 5 / 4 +(Math.pow(this.n, 4) -Math.pow(this.n, 5)) * 81 / 64) * Math.PI / 180;
			this.A2 = (this.n - Math.pow(this.n, 2) + (Math.pow(this.n, 3) -Math.pow(this.n, 4)) * 7 / 8 + Math.pow(this.n, 5) * 55 / 64) * 3 * this.a / 2;
			this.A3 = (Math.pow(this.n, 2) -Math.pow(this.n, 3) + (Math.pow(this.n, 4) - Math.pow(this.n, 5)) * 3 / 4) * 15 * this.a / 16;
			this.A4 = (Math.pow(this.n, 3) -Math.pow(this.n, 4) + Math.pow(this.n, 5) * 11 / 16) * 35 * this.a / 48;		
			return true;
		}
		
	}
	
	SetAB(da,db){
		this.a = da;
		this.b = db;
		this.f = this.a / (this.a - this.b);
		this.e2 = 1 - ((this.f - 1) / this.f) * ((this.f - 1) / this.f);
		this.e12 = (this.f / (this.f - 1)) * (this.f / (this.f - 1)) - 1;
		this.n=(this.a - this.b) / (this.a + this.b);
		this.A1 = this.a * (1 - this.n + (Math.pow(this.n, 2) - Math.pow(this.n, 3)) * 5 / 4 + (Math.pow(this.n, 4) - Math.pow(this.n, 5)) * 81 / 64) * Math.PI / 180;
		this.A2 = (this.n - Math.pow(this.n, 2) + (Math.pow(this.n, 3) - Math.pow(this.n, 4)) * 7 / 8 + Math.pow(this.n, 5) * 55 / 64) * 3 * this.a / 2;
		this.A3 = (Math.pow(this.n, 2) - Math.pow(this.n, 3) + (Math.pow(this.n, 4) -Math.pow(this.n, 5)) * 3 / 4) * 15 * this.a / 16;
		this.A4 = (Math.pow(this.n, 3) - Math.pow(this.n, 4) + Math.pow(this.n, 5) * 11 / 16) * 35 * this.a / 48;
		return true;
		
		
		
		
	}
	
	SetParaDegree(ParaDegree)
	{
		this.m_ParaDegree = ParaDegree;
		return true;
	}
	
	SetZoneNum(ZoneNum)
	{
		this.m_ZoneNum = ZoneNum;
		var dOriginLongitude=(ZoneNum - 1) * this.m_ParaDegree + this.m_ParaDegree / 2;
		this.m_OriginLongitude = Dms2Rad(dOriginLongitude);
		return true;
	}
	
	SetOriginLongitude(dOriginLongitude)
	{
		this.m_OriginLongitude = Dms2Rad(dOriginLongitude);
		return true;
	}
	
	SetLoLa(dLo, dLa)
	{   
		this.m_Lo = Dms2Rad(dLo);
		this.m_La = Dms2Rad(dLa);

	//	m_Lo = dLo;
	//	m_La = dLa;
		
		this.LoLaToxy();
		
		
		return true;
	}
	
	/*
	GetLoLa(double *dLo, double *dLa)
	{
		*dLo = Rad2Dms(m_Lo);
		*dLa = Rad2Dms(m_La);
		return true;
	}
	*/
	GetLoLa(dLo, dLa)
	{
		dLo = Rad2Dms(this.m_Lo);
		dLa = Rad2Dms(this.m_La);
		return true;
	}
	
	/*
	GetSpaceCoord(double *dx, double *dy,double *dz)
	{
		*dx=a*b/sqrt(b*b+a*a*tan(m_La)*tan(m_La));
		*dy=*dx*tan(m_Lo);
		*dz=*dx*tan(m_La);
		return true;
	}*/
	
	GetSpaceCoord(dx, dy, dz)
	{
		 dx = this.a * this.b / Math.sqrt(this.b * this.b + this.a * this.a * Math.tan(this.m_La) * Math.tan(this.m_La));
		 dy = dx * Math.tan(this.m_Lo);
		 dz = dx * Math.tan(this.m_La);
		return true;
	}
	
	Setxy(dx, dy)
	{
		var ddy = Math.floor(dy / 1000000);
		var newX, newY;
		newX = dx;
		newY = dy;
		if(this.m_ZoneNum != ddy) 
		{
			var dOriginLongitude=(ddy-1) * this.m_ParaDegree + this.m_ParaDegree / 2;
			SetOriginLongitude(dOriginLongitude);
			SetTempxy(dx, dy);
			var dB,dL;
			GetLoLa(dB, dL);
			SetZoneNum(this.m_ZoneNum);
			//SetLoLa(dB,dL);
			LoLaToxy();
			Getxy(newX,newY);
		}
		
		SetTempxy(newX,newY);
		return true;
	}
	
    SetTempxy(dx, dy)
	{
		var tempy = dy % 1000000;
		this.x = dx;
		this.y = tempy;
		xyToLoLa();
		return true;
	}
	
	/*
	bool PrjPoint::Getxy(double *dx, double *dy)
	{
		double newX,newY;
		newX=x;newY=m_ZoneNum*1000000+y;
		//CString cs;
		//cs.Format("%f",newY);
		//AfxMessageBox(cs);
		*dx = newX;
		*dy = newY;
		return true;
	}*/
    Getxy(dx, dy)
	{
		var newX, newY;
		newX = this.x;
		newY = this.m_ZoneNum * 1000000 + this.y;
		/*CString cs;
		cs.Format("%f",newY);
		AfxMessageBox(cs);*/
		
		dx = newX;
		dy = newY;
		
		
		return [dx, dy];
	}
	
	
}

function Dms2Rad(Dms)
{
	var Degree, Miniute;
	var Second;
	var Sign;
	var Rad;
	if(Dms >= 0){
		Sign = 1;
	}	
	else{
		Sign = -1;
	}
		
	Dms = Math.abs(Dms);
	Degree = Math.floor(Dms);
	Minute = Math.floor((Dms * 100.0) % 100.0);
	Second = (Dms * 10000.0) % 100.0;
	Rad = Dms * Math.PI / 180.0;

	return Rad;
}

function Rad2Dms(Rad)
{
	var Degree, Minute;
	var Second;
	var Sign;
	var Dms;

	if (Rad >= 0) {
		Sign = 1;
	} else {
		Sign = -1;
	}
	Rad = Math.abs(Rad * 180.0 / Math.PI);
	Degree = Math.floor(Rad);
	Minute = Math.floor((Rad * 60.0) % 60.0);
	Second = (Rad * 3600.0) % 60.0;
    Dms = Sign * (Degree + Minute / 100.0 + Second / 10000.0);
    
    return Dms;
}