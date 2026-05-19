'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Globe, Plus, X, Clock } from 'lucide-react';

interface CityZone {
  city: string;
  cityAr: string;
  zone: string;
}

const DEFAULT_ZONES: CityZone[] = [
  { city: 'UTC', cityAr: 'التوقيت العالمي', zone: 'UTC' },
  { city: 'New York', cityAr: 'نيويورك', zone: 'America/New_York' },
  { city: 'London', cityAr: 'لندن', zone: 'Europe/London' },
  { city: 'Dubai', cityAr: 'دبي', zone: 'Asia/Dubai' },
  { city: 'Cairo', cityAr: 'القاهرة', zone: 'Africa/Cairo' },
  { city: 'Tokyo', cityAr: 'طوكيو', zone: 'Asia/Tokyo' },
  { city: 'Sydney', cityAr: 'سيدني', zone: 'Australia/Sydney' },
];

const EXTRA_ZONES: CityZone[] = [
  { city: 'Paris', cityAr: 'باريس', zone: 'Europe/Paris' },
  { city: 'Berlin', cityAr: 'برلين', zone: 'Europe/Berlin' },
  { city: 'Moscow', cityAr: 'موسكو', zone: 'Europe/Moscow' },
  { city: 'Mumbai', cityAr: 'مومباي', zone: 'Asia/Kolkata' },
  { city: 'Shanghai', cityAr: 'شنغهاي', zone: 'Asia/Shanghai' },
  { city: 'Seoul', cityAr: 'سيول', zone: 'Asia/Seoul' },
  { city: 'Singapore', cityAr: 'سنغافورة', zone: 'Asia/Singapore' },
  { city: 'Los Angeles', cityAr: 'لوس أنجلوس', zone: 'America/Los_Angeles' },
  { city: 'Chicago', cityAr: 'شيكاغو', zone: 'America/Chicago' },
  { city: 'São Paulo', cityAr: 'ساو باولو', zone: 'America/Sao_Paulo' },
  { city: 'Riyadh', cityAr: 'الرياض', zone: 'Asia/Riyadh' },
  { city: 'Istanbul', cityAr: 'إسطنبول', zone: 'Europe/Istanbul' },
  { city: 'Karachi', cityAr: 'كراتشي', zone: 'Asia/Karachi' },
  { city: 'Bangkok', cityAr: 'بانكوك', zone: 'Asia/Bangkok' },
  { city: 'Hong Kong', cityAr: 'هونغ كونغ', zone: 'Asia/Hong_Kong' },
  { city: 'Auckland', cityAr: 'أوكلاند', zone: 'Pacific/Auckland' },
];

export default function WorldClock({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [zones, setZones] = useState<CityZone[]>(DEFAULT_ZONES);
  const [now, setNow] = useState(new Date());
  const [is24h, setIs24h] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = useCallback(
    (zone: string) => {
      try {
        return now.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
          timeZone: zone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: !is24h,
        });
      } catch {
        return '--:--:--';
      }
    },
    [now, is24h, isAr]
  );

  const formatDate = useCallback(
    (zone: string) => {
      try {
        return now.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
          timeZone: zone,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      } catch {
        return '';
      }
    },
    [now, isAr]
  );

  const getOffset = useCallback(
    (zone: string) => {
      try {
        const utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
        const zoneStr = now.toLocaleString('en-US', { timeZone: zone });
        const diff = new Date(zoneStr).getTime() - new Date(utcStr).getTime();
        const hours = diff / (1000 * 60 * 60);
        const sign = hours >= 0 ? '+' : '';
        return `UTC${sign}${hours}`;
      } catch {
        return '';
      }
    },
    [now]
  );

  const addZone = (z: CityZone) => {
    if (!zones.find((existing) => existing.zone === z.zone)) {
      setZones((prev) => [...prev, z]);
    }
    setShowAdd(false);
    setSearch('');
  };

  const removeZone = (zone: string) => {
    setZones((prev) => prev.filter((z) => z.zone !== zone));
  };

  const filteredExtra = EXTRA_ZONES.filter(
    (z) =>
      !zones.find((existing) => existing.zone === z.zone) &&
      (z.city.toLowerCase().includes(search.toLowerCase()) ||
        z.cityAr.includes(search))
  );

  return (
    <Card className="tool-wrapper-card" dir={isAr ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="tool-section-title">
            <Globe className="size-5" />
            {isAr ? 'الساعة العالمية' : 'World Clock'}
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">12h</span>
              <Switch checked={is24h} onCheckedChange={setIs24h} />
              <span className="text-sm text-muted-foreground">24h</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="size-4 me-1" />
              {isAr ? 'إضافة مدينة' : 'Add City'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

      {/* Add city panel */}
      {showAdd && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder={isAr ? 'ابحث عن مدينة...' : 'Search city...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="tool-input"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredExtra.map((z) => (
                <Button
                  key={z.zone}
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs"
                  onClick={() => addZone(z)}
                >
                  <Plus className="size-3 me-1" />
                  {isAr ? z.cityAr : z.city}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clock grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {zones.map((z) => (
          <Card key={z.zone} className="group relative overflow-hidden">
            <button
              onClick={() => removeZone(z.zone)}
              className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-destructive/10 text-destructive"
              aria-label={isAr ? 'إزالة' : 'Remove'}
            >
              <X className="size-3.5" />
            </button>
            <CardHeader className="pb-1 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {isAr ? z.cityAr : z.city}
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {getOffset(z.zone)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-sky-500 shrink-0" />
                <span className="text-xl font-mono font-semibold tracking-tight">
                  {formatTime(z.zone)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(z.zone)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}
