'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, Plus, Trash2 } from 'lucide-react';

interface Alarm {
  id: string;
  name: string;
  time: string; // HH:MM
  enabled: boolean;
  triggered: boolean;
}

function playAlarmBeep() {
  try {
    const ctx = new AudioContext();
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      osc.type = 'square';
      gain.gain.value = 0.15;
      osc.start(ctx.currentTime + i * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 0.25);
      osc.stop(ctx.currentTime + i * 0.3 + 0.25);
    }
  } catch {
    // Audio not available
  }
}

export default function AlarmCreator({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newTime, setNewTime] = useState('08:00');
  const [newName, setNewName] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Check alarms — compute triggered state from current time
  const currentTimeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const triggeredIds = alarms
    .filter((a) => a.enabled && !a.triggered && a.time === currentTimeStr)
    .map((a) => a.id);

  if (triggeredIds.length > 0) {
    playAlarmBeep();
    setAlarms((prev) =>
      prev.map((a) =>
        triggeredIds.includes(a.id) ? { ...a, triggered: true } : a
      )
    );
  }

  const addAlarm = () => {
    if (!newTime) return;
    const alarm: Alarm = {
      id: Date.now().toString(),
      name: newName || (isAr ? 'منبه' : 'Alarm'),
      time: newTime,
      enabled: true,
      triggered: false,
    };
    setAlarms((prev) => [...prev, alarm]);
    setNewName('');
  };

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, enabled: !a.enabled, triggered: a.enabled ? a.triggered : false }
          : a
      )
    );
  };

  const dismissAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, triggered: false } : a))
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Card className="tool-wrapper-card" dir={isAr ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <CardTitle className="tool-section-title">
          <Bell className="size-5" />
          {isAr ? 'إنشاء منبه' : 'Alarm Creator'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

      {/* Add alarm */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>{isAr ? 'الوقت' : 'Time'}</Label>
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="tool-input font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{isAr ? 'اسم المنبه' : 'Alarm Name'}</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={isAr ? 'اسم اختياري' : 'Optional name'}
                className="tool-input"
              />
            </div>
            <Button onClick={addAlarm} className="tool-action-btn gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="size-4" />
              {isAr ? 'إضافة' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Triggered alarm alert */}
      {alarms.some((a) => a.triggered) && (
        <Card className="border-destructive animate-pulse">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 flex-wrap">
              <BellRing className="size-6 text-destructive" />
              <span className="font-semibold text-destructive">
                {isAr ? '!منبه يعمل' : 'Alarm ringing!'}
              </span>
              {alarms
                .filter((a) => a.triggered)
                .map((a) => (
                  <Button
                    key={a.id}
                    size="sm"
                    variant="outline"
                    onClick={() => dismissAlarm(a.id)}
                  >
                    {isAr ? 'كتم' : 'Dismiss'} {a.name}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alarm list */}
      {alarms.length > 0 ? (
        <div className="space-y-2">
          {alarms.map((a) => (
            <Card key={a.id} className={a.triggered ? 'border-destructive' : ''}>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-mono font-semibold">{a.time}</span>
                    <Badge variant="secondary" className="text-xs">{a.name}</Badge>
                    {a.triggered && (
                      <Badge variant="destructive" className="text-xs">
                        {isAr ? 'يعمل!' : 'Ringing!'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={a.enabled} onCheckedChange={() => toggleAlarm(a.id)} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteAlarm(a.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Bell className="size-8 mx-auto mb-2 opacity-40" />
            <p>{isAr ? 'لا توجد منبهات بعد' : 'No alarms yet'}</p>
          </CardContent>
        </Card>
      )}
      </CardContent>
    </Card>
  );
}
