'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const labels = {
  en: {
    title: 'SSL Certificate Parser',
    note: 'This tool parses certificate data locally. It does not verify signatures, trust chains, hostnames, revocation, or certificate transparency.',
    placeholder: 'Paste your SSL certificate in PEM format here...\n\n-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV...\n-----END CERTIFICATE-----',
    parse: 'Parse Certificate',
    parsedInfo: 'Certificate Information',
    subject: 'Subject',
    issuer: 'Issuer',
    validFrom: 'Valid From',
    validTo: 'Valid To',
    serialNumber: 'Serial Number',
    algorithm: 'Signature Algorithm',
    status: 'Status',
    valid: 'Valid',
    expired: 'Expired',
    notYetValid: 'Not Yet Valid',
    chain: 'Certificate Chain',
    certificates: 'certificate(s) found',
    noCert: 'Could not parse the certificate. Please paste a valid PEM certificate.',
    daysRemaining: 'days remaining',
    daysAgo: 'days ago',
  },
  ar: {
    title: 'محلل شهادة SSL',
    note: 'تحلل هذه الأداة بيانات الشهادة محلياً. لا تتحقق من التوقيعات أو سلاسل الثقة أو أسماء المضيفين أو الإلغاء أو شفافية الشهادات.',
    placeholder: 'الصق شهادة SSL بتنسيق PEM هنا...\n\n-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV...\n-----END CERTIFICATE-----',
    parse: 'تحليل الشهادة',
    parsedInfo: 'معلومات الشهادة',
    subject: 'الموضوع',
    issuer: 'المُصدر',
    validFrom: 'صالحة من',
    validTo: 'صالحة إلى',
    serialNumber: 'الرقم التسلسلي',
    algorithm: 'خوارزمية التوقيع',
    status: 'الحالة',
    valid: 'صالحة',
    expired: 'منتهية',
    notYetValid: 'غير صالحة بعد',
    chain: 'سلسلة الشهادات',
    certificates: 'شهادة/شهادات موجودة',
    noCert: 'لم يتم تحليل الشهادة. الصق شهادة PEM صالحة.',
    daysRemaining: 'يوم متبقي',
    daysAgo: 'يوم مضى',
  },
};

function decodeBase64(str: string): string {
  try {
    return atob(str.replace(/\s/g, ''));
  } catch {
    return '';
  }
}

type DerElement = { tag: number; contentStart: number; end: number };

type ParsedCertificate = {
  subject: string;
  issuer: string;
  serialNumber: string;
  signatureAlgorithmOid: string;
  validFrom: Date;
  validTo: Date;
};

const MAX_CERTIFICATE_BASE64_LENGTH = 4 * 1024 * 1024;
const MAX_CERTIFICATE_INPUT_LENGTH = 8 * 1024 * 1024;
const MAX_CERTIFICATE_BLOCKS = 32;

const ATTRIBUTE_NAMES: Record<string, string> = {
  '1.2.840.113549.1.9.1': 'emailAddress',
  '2.5.4.3': 'CN',
  '2.5.4.6': 'C',
  '2.5.4.7': 'L',
  '2.5.4.8': 'ST',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
};

const SIGNATURE_ALGORITHM_NAMES: Record<string, string> = {
  '1.2.840.113549.1.1.4': 'md5WithRSAEncryption',
  '1.2.840.113549.1.1.5': 'sha1WithRSAEncryption',
  '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
  '1.2.840.113549.1.1.12': 'sha384WithRSAEncryption',
  '1.2.840.113549.1.1.13': 'sha512WithRSAEncryption',
  '1.2.840.10045.4.1': 'ecdsa-with-SHA1',
  '1.2.840.10045.4.3.2': 'ecdsa-with-SHA256',
  '1.2.840.10045.4.3.3': 'ecdsa-with-SHA384',
  '1.2.840.10045.4.3.4': 'ecdsa-with-SHA512',
};

function readDerElement(bytes: Uint8Array, offset: number, limit = bytes.length): DerElement | null {
  if (offset < 0 || limit > bytes.length || offset + 2 > limit) return null;

  const tag = bytes[offset];
  const lengthByte = bytes[offset + 1];
  let length = lengthByte;
  let headerSize = 2;
  if (lengthByte & 0x80) {
    const lengthBytes = lengthByte & 0x7f;
    if (lengthBytes === 0 || lengthBytes > 4 || offset + 2 + lengthBytes > limit) return null;
    if (lengthBytes > 1 && bytes[offset + 2] === 0) return null;
    length = 0;
    for (let i = 0; i < lengthBytes; i++) length = length * 256 + bytes[offset + 2 + i];
    if (length < 0x80) return null;
    headerSize += lengthBytes;
  }

  const contentStart = offset + headerSize;
  const end = contentStart + length;
  return end <= limit ? { tag, contentStart, end } : null;
}

function readDerChildren(bytes: Uint8Array, sequence: DerElement): DerElement[] | null {
  const children: DerElement[] = [];
  for (let offset = sequence.contentStart; offset < sequence.end;) {
    const child = readDerElement(bytes, offset, sequence.end);
    if (!child) return null;
    children.push(child);
    offset = child.end;
  }
  return children;
}

function formatHex(bytes: Uint8Array): string {
  let result = '';
  for (const byte of bytes) result += byte.toString(16).padStart(2, '0');
  return result.toUpperCase();
}

function readBase128Arc(bytes: Uint8Array, offset: number, limit: number): { value: number; nextOffset: number } | null {
  let value = 0;
  let firstGroup = true;
  while (offset < limit) {
    const byte = bytes[offset++];
    if (firstGroup && byte === 0x80) return null;
    firstGroup = false;
    const digit = byte & 0x7f;
    if (value > (Number.MAX_SAFE_INTEGER - digit) / 128) return null;
    value = value * 128 + digit;
    if (!(byte & 0x80)) return { value, nextOffset: offset };
  }
  return null;
}

function readDerOid(bytes: Uint8Array, element: DerElement | undefined): string | null {
  if (!element || element.tag !== 0x06 || element.contentStart >= element.end) return null;
  const firstSubidentifier = readBase128Arc(bytes, element.contentStart, element.end);
  if (!firstSubidentifier) return null;
  const firstArc = firstSubidentifier.value < 40 ? 0 : firstSubidentifier.value < 80 ? 1 : 2;
  const arcs = [firstArc, firstSubidentifier.value - firstArc * 40];
  let offset = firstSubidentifier.nextOffset;
  while (offset < element.end) {
    const arc = readBase128Arc(bytes, offset, element.end);
    if (!arc) return null;
    arcs.push(arc.value);
    offset = arc.nextOffset;
  }
  return arcs.join('.');
}

function readAlgorithmIdentifier(bytes: Uint8Array, element: DerElement): string | null {
  if (element.tag !== 0x30) return null;
  const children = readDerChildren(bytes, element);
  if (!children || children.length < 1 || children.length > 2) return null;
  return readDerOid(bytes, children[0]);
}

function readDerInteger(bytes: Uint8Array, element: DerElement): string | null {
  if (element.tag !== 0x02 || element.contentStart >= element.end) return null;
  const firstByte = bytes[element.contentStart];
  if (firstByte & 0x80) return null;
  if (element.end - element.contentStart > 1 && firstByte === 0 && !(bytes[element.contentStart + 1] & 0x80)) return null;
  let offset = element.contentStart;
  while (offset + 1 < element.end && bytes[offset] === 0) offset++;
  if (element.end - offset > 20) return null;
  return formatHex(bytes.slice(offset, element.end));
}

function decodeDerString(bytes: Uint8Array, element: DerElement): string | null {
  const value = bytes.slice(element.contentStart, element.end);
  if (element.tag === 0x0c) {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(value);
    } catch {
      return null;
    }
  }
  if (element.tag === 0x13 || element.tag === 0x16) {
    if (value.some((byte) => byte > 0x7f)) return null;
    let text = '';
    for (const byte of value) text += String.fromCharCode(byte);
    return text;
  }
  if (element.tag === 0x1e) {
    if (value.length % 2 !== 0) return null;
    let text = '';
    for (let offset = 0; offset < value.length; offset += 2) {
      text += String.fromCharCode((value[offset] << 8) | value[offset + 1]);
    }
    return text;
  }
  return null;
}

function readName(bytes: Uint8Array, element: DerElement): string | null {
  if (element.tag !== 0x30) return null;
  const rdns = readDerChildren(bytes, element);
  if (!rdns) return null;
  const formattedRdns: string[] = [];
  for (const rdn of rdns) {
    if (rdn.tag !== 0x31) return null;
    const attributes = readDerChildren(bytes, rdn);
    if (!attributes || attributes.length === 0) return null;
    const formattedAttributes: string[] = [];
    for (const attribute of attributes) {
      const parts = attribute.tag === 0x30 ? readDerChildren(bytes, attribute) : null;
      if (!parts || parts.length !== 2) return null;
      const oid = readDerOid(bytes, parts[0]);
      if (!oid) return null;
      const decodedValue = decodeDerString(bytes, parts[1]);
      const value = decodedValue ?? `#${formatHex(bytes.slice(parts[1].contentStart, parts[1].end))}`;
      const name = ATTRIBUTE_NAMES[oid] ?? oid;
      formattedAttributes.push(`${name}=${value.replace(/([\\,+])/g, '\\$1')}`);
    }
    formattedRdns.push(formattedAttributes.join('+'));
  }
  return formattedRdns.join(', ');
}

function parseDerTime(bytes: Uint8Array, element: DerElement): Date | null {
  let value = '';
  for (let offset = element.contentStart; offset < element.end; offset++) value += String.fromCharCode(bytes[offset]);
  const match = element.tag === 0x17
    ? value.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/)
    : element.tag === 0x18
      ? value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/)
      : null;
  if (!match) return null;

  const yearValue = Number(match[1]);
  const year = element.tag === 0x17
    ? (yearValue >= 50 ? 1900 + yearValue : 2000 + yearValue)
    : yearValue;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    return null;
  }

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
    ? date
    : null;
}

function getTbsFieldStart(bytes: Uint8Array, children: DerElement[]): number | null {
  if (children[0]?.tag !== 0xa0) return 0;
  const versionChildren = readDerChildren(bytes, children[0]);
  const version = versionChildren?.[0];
  if (!version || versionChildren.length !== 1 || version.tag !== 0x02 || version.end - version.contentStart !== 1) return null;
  return bytes[version.contentStart] <= 2 ? 1 : null;
}

function isDerBitString(bytes: Uint8Array, element: DerElement | undefined): boolean {
  if (!element || element.tag !== 0x03 || element.end - element.contentStart < 2) return false;
  const unusedBits = bytes[element.contentStart];
  if (unusedBits > 7) return false;
  const lastByte = bytes[element.end - 1];
  const paddingMask = unusedBits === 0 ? 0 : (1 << unusedBits) - 1;
  return (lastByte & paddingMask) === 0;
}

function isValidTbsOptionalField(bytes: Uint8Array, field: DerElement): boolean {
  if (field.tag === 0x81 || field.tag === 0x82) return isDerBitString(bytes, { ...field, tag: 0x03 });
  if (field.tag !== 0xa3) return false;
  const extensionWrapper = readDerChildren(bytes, field);
  return Boolean(extensionWrapper?.length === 1 && extensionWrapper[0].tag === 0x30);
}

function readCertificateFields(decoded: string): ParsedCertificate | null {
  const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
  if (bytes.length < 64) return null;
  const certificate = readDerElement(bytes, 0);
  if (!certificate || certificate.tag !== 0x30 || certificate.end !== bytes.length) return null;

  const certificateChildren = readDerChildren(bytes, certificate);
  if (!certificateChildren || certificateChildren.length !== 3) return null;
  const [tbsCertificate, signatureAlgorithm, signatureValue] = certificateChildren;
  if (tbsCertificate.tag !== 0x30 || !isDerBitString(bytes, signatureValue)) return null;
  const signatureAlgorithmOid = readAlgorithmIdentifier(bytes, signatureAlgorithm);
  if (!signatureAlgorithmOid) return null;

  const tbsChildren = readDerChildren(bytes, tbsCertificate);
  if (!tbsChildren) return null;
  const firstField = getTbsFieldStart(bytes, tbsChildren);
  const requiredTags = [0x02, 0x30, 0x30, 0x30, 0x30, 0x30];
  if (firstField === null || tbsChildren.length < firstField + requiredTags.length) return null;
  if (!requiredTags.every((tag, index) => tbsChildren[firstField + index]?.tag === tag)) return null;
  if (!tbsChildren.slice(firstField + requiredTags.length).every((field) => isValidTbsOptionalField(bytes, field))) return null;

  const serialNumber = readDerInteger(bytes, tbsChildren[firstField]);
  const tbsSignatureAlgorithmOid = readAlgorithmIdentifier(bytes, tbsChildren[firstField + 1]);
  const issuer = readName(bytes, tbsChildren[firstField + 2]);
  const validityChildren = readDerChildren(bytes, tbsChildren[firstField + 3]);
  const subject = readName(bytes, tbsChildren[firstField + 4]);
  const publicKeyChildren = readDerChildren(bytes, tbsChildren[firstField + 5]);
  if (!serialNumber || !tbsSignatureAlgorithmOid || tbsSignatureAlgorithmOid !== signatureAlgorithmOid || issuer === null || subject === null) return null;
  if (!validityChildren || validityChildren.length !== 2 || !publicKeyChildren || publicKeyChildren.length !== 2) return null;
  if (!readAlgorithmIdentifier(bytes, publicKeyChildren[0]) || !isDerBitString(bytes, publicKeyChildren[1])) return null;

  const validFrom = parseDerTime(bytes, validityChildren[0]);
  const validTo = parseDerTime(bytes, validityChildren[1]);
  if (!validFrom || !validTo || validFrom > validTo) return null;
  return { subject, issuer, serialNumber, signatureAlgorithmOid, validFrom, validTo };
}

interface CertInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validFromTimestamp: number;
  validTo: string;
  validToTimestamp: number;
  serialNumber: string;
  algorithm: string;
}

function parseCertificate(pem: string): CertInfo | null {
  const b64 = pem.replace(/-----BEGIN CERTIFICATE-----/, '').replace(/-----END CERTIFICATE-----/, '').replace(/\s/g, '');
  if (!b64 || b64.length > MAX_CERTIFICATE_BASE64_LENGTH) return null;
  const decoded = decodeBase64(b64);
  const parsed = decoded ? readCertificateFields(decoded) : null;
  if (!parsed) return null;

  return {
    subject: parsed.subject || 'Unknown',
    issuer: parsed.issuer || 'Unknown',
    validFrom: parsed.validFrom.toLocaleDateString(),
    validFromTimestamp: parsed.validFrom.getTime(),
    validTo: parsed.validTo.toLocaleDateString(),
    validToTimestamp: parsed.validTo.getTime(),
    serialNumber: parsed.serialNumber,
    algorithm: SIGNATURE_ALGORITHM_NAMES[parsed.signatureAlgorithmOid] ?? `OID ${parsed.signatureAlgorithmOid}`,
  };
}

export default function SslChecker({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [input, setInput] = useState('');
  const [certs, setCerts] = useState<CertInfo[]>([]);

  const handleParse = () => {
    if (input.length > MAX_CERTIFICATE_INPUT_LENGTH) {
      setCerts([]);
      return;
    }
    const pemBlocks = input.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) || [];
    if (pemBlocks.length > MAX_CERTIFICATE_BLOCKS) {
      setCerts([]);
      return;
    }
    const parsed: CertInfo[] = [];
    for (const pem of pemBlocks) {
      const cert = parseCertificate(pem);
      if (cert) parsed.push(cert);
    }
    if (parsed.length === 0) {
      // Try parsing as raw base64
      const cert = parseCertificate(input);
      if (cert) parsed.push(cert);
    }
    setCerts(parsed);
  };

  const getStatus = (validFromTimestamp: number, validToTimestamp: number): 'valid' | 'expired' | 'notYetValid' => {
    const now = Date.now();
    if (!Number.isFinite(validFromTimestamp) || !Number.isFinite(validToTimestamp) || now < validFromTimestamp) {
      return 'notYetValid';
    }
    return now > validToTimestamp ? 'expired' : 'valid';
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Shield className="size-5" />
            {t.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{t.note}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="tool-input min-h-[200px] resize-y font-mono text-xs"
          />
          <Button onClick={handleParse} className="tool-action-btn">{t.parse}</Button>
        </CardContent>
      </Card>

      {certs.length > 0 && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.chain} — {certs.length} {t.certificates}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {certs.map((cert, i) => {
                const status = getStatus(cert.validFromTimestamp, cert.validToTimestamp);
                return (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{i + 1}</span>
                      {status === 'valid' ? (
                        <Badge className="bg-emerald-500"><CheckCircle className="size-3 me-1" />{t.valid}</Badge>
                      ) : status === 'expired' ? (
                        <Badge variant="destructive"><XCircle className="size-3 me-1" />{t.expired}</Badge>
                      ) : (
                        <Badge variant="secondary"><AlertTriangle className="size-3 me-1" />{t.notYetValid}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">{t.subject}:</span> <span className="font-mono text-xs break-all">{cert.subject}</span></div>
                      <div><span className="text-muted-foreground">{t.issuer}:</span> <span className="font-mono text-xs break-all">{cert.issuer}</span></div>
                      <div><span className="text-muted-foreground">{t.validFrom}:</span> {cert.validFrom}</div>
                      <div><span className="text-muted-foreground">{t.validTo}:</span> {cert.validTo}</div>
                      <div><span className="text-muted-foreground">{t.serialNumber}:</span> <span className="font-mono text-xs">{cert.serialNumber}</span></div>
                      <div><span className="text-muted-foreground">{t.algorithm}:</span> {cert.algorithm}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      {input && certs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="size-8 mx-auto mb-2 text-amber-500" />
            <p className="text-sm text-muted-foreground">{t.noCert}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
