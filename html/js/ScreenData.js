class Vec2 {
	constructor(x = 0, y = 0) {
		this.m_x = x;
		this.m_y = y;
	}

	get x() { return this.m_x };
	get y() { return this.m_y };

	set x(value) { this.m_x = value; };
	set y(value) { this.m_y = value; };
}

class Rect {
	constructor(x = 0, y = 0, w = 1, h = 1) {
		this.m_pos = new Vec2(x, y);
		this.m_size = new Vec2(w, h);
	}

	get x() { return this.m_pos.x; };
	get y() { return this.m_pos.y; };

	get width() { return this.m_size.x; };
	get height() { return this.m_size.y; };

	set x(value) { this.m_pos.x = value; };
	set y(value) { this.m_pos.y = value; };

	set width(value) { this.m_size.x = value; };
	set height(value) { this.m_size.y = value; };
}

class Color {
	constructor(_r = 255, _g = 255, _b = 255) {
		this.m_r = Math.trunc(_r);
		this.m_g = Math.trunc(_g);
		this.m_b = Math.trunc(_b);

		this.m_r = Math.max(0, Math.min(255, this.m_r));
		this.m_g = Math.max(0, Math.min(255, this.m_g));
		this.m_b = Math.max(0, Math.min(255, this.m_b));
	}

	get r() { return this.m_r; };
	get g() { return this.m_g; };
	get b() { return this.m_b; };

	set r(value) { this.m_r = value; };
	set g(value) { this.m_g = value; };
	set b(value) { this.m_b = value; };
}