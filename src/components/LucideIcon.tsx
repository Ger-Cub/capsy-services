import React from 'react';
import {
  User,
  Heart,
  Users,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Headphones,
  Smile,
  Lock,
  Award,
  Sparkles,
  Calendar,
  Phone,
  MapPin,
  Globe,
  Send,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  X,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  HeartCrack,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  Target,
  MessageSquareShare,
  Coins,
  MessageSquare,
  Bot,
  ExternalLink,
  Maximize2,
  ChevronLeft,
  Plus,
  Mic,
  Map,
  ArrowUp
} from 'lucide-react';

const iconMap = {
  User,
  Heart,
  Users,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Headphones,
  Smile,
  Lock,
  Award,
  Sparkles,
  Calendar,
  Phone,
  MapPin,
  Globe,
  Send,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  X,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  HeartCrack,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  Target,
  MessageSquareShare,
  Coins,
  MessageSquare,
  Bot,
  ExternalLink,
  Maximize2,
  ChevronLeft,
  Plus,
  Mic,
  Map,
  ArrowUp
};

export type IconName = keyof typeof iconMap;

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export default function LucideIcon({ name, className = '', size, strokeWidth }: LucideIconProps) {
  // Safe lookup with a fallback icon
  const IconComponent = iconMap[name as IconName] || HelpCircle;
  return <IconComponent className={className} size={size} strokeWidth={strokeWidth} />;
}
