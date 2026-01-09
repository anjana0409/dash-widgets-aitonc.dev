import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Cogl from 'gi://Cogl';

const AnalogClockWidget = GObject.registerClass(
class AnalogClockWidget extends St.DrawingArea {
    _init() {
        super._init({
            style_class: 'analog-clock-widget',
            x_expand: true,
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
            x_align: Clutter.ActorAlign.CENTER,
            visible: true,
            width: 48,
            height: 48,
        });
    }

    vfunc_repaint() {
        const cr = this.get_context();
        const [width, height] = this.get_surface_size();
        const radius = Math.min(width, height) / 2 - 5;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background
        cr.setSourceRGBA(0.1, 0.1, 0.1, 0.8);
        cr.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        cr.fill();

        // Clock Face
        cr.setSourceRGBA(1, 1, 1, 1);
        cr.setLineWidth(2);
        cr.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        cr.stroke();

        // Hour and minute marks
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            cr.setLineWidth(i % 3 === 0 ? 2 : 1);
            cr.moveTo(centerX + Math.cos(angle) * (radius - 5), centerY + Math.sin(angle) * (radius - 5));
            cr.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
            cr.stroke();
        }

        const time = GLib.DateTime.new_now_local();
        const hours = time.get_hour() % 12;
        const minutes = time.get_minute();
        const seconds = time.get_second();

        // Hour Hand
        const hourAngle = ((hours + minutes / 60) * 30 - 90) * Math.PI / 180;
        cr.setLineWidth(3);
        cr.moveTo(centerX, centerY);
        cr.lineTo(centerX + Math.cos(hourAngle) * radius * 0.5, centerY + Math.sin(hourAngle) * radius * 0.5);
        cr.stroke();

        // Minute Hand
        const minuteAngle = (minutes * 6 - 90) * Math.PI / 180;
        cr.setLineWidth(2);
        cr.moveTo(centerX, centerY);
        cr.lineTo(centerX + Math.cos(minuteAngle) * radius * 0.8, centerY + Math.sin(minuteAngle) * radius * 0.8);
        cr.stroke();

        // Second Hand
        const secondAngle = (seconds * 6 - 90) * Math.PI / 180;
        cr.setSourceRGBA(1, 0, 0, 0.8);
        cr.setLineWidth(1);
        cr.moveTo(centerX, centerY);
        cr.lineTo(centerX + Math.cos(secondAngle) * radius * 0.9, centerY + Math.sin(secondAngle) * radius * 0.9);
        cr.stroke();

        cr.$dispose();
    }

    enable() {
        this.queue_repaint();
        this._timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            this.queue_repaint();
            return GLib.SOURCE_CONTINUE;
        });
    }

    disable() {
        if (this._timer) {
            GLib.source_remove(this._timer);
            this._timer = null;
        }
    }
});

export default AnalogClockWidget;
