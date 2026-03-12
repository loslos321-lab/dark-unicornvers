import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Lock, FileText, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface EthicalHackingAgreementProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const EthicalHackingAgreement = ({ onAccept, onDecline }: EthicalHackingAgreementProps) => {
  const [agreements, setAgreements] = useState({
    authorizedOnly: false,
    legalCompliance: false,
    noHarm: false,
    disclosure: false,
    educationOnly: false
  });

  const allChecked = Object.values(agreements).every(v => v);

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Card className="max-w-2xl w-full bg-slate-950 border-red-500/50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-red-500/30 bg-red-950/20">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-red-500 font-mono">
                ETHICAL HACKING AGREEMENT
              </h1>
              <p className="text-red-400 text-sm font-mono">
                Legally Binding Terms of Use
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-amber-400 bg-amber-950/30 p-3 rounded border border-amber-500/30">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-mono">
              This tool is designed for authorized security testing only. 
              Misuse may violate computer fraud laws (CFAA, StGB §202a+, etc.)
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="space-y-4 text-sm text-slate-300">
            <p className="font-mono leading-relaxed">
              By using Dark Unicorn Agent, you acknowledge and agree to the following terms:
            </p>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 rounded bg-slate-900/50 border border-slate-700 hover:border-red-500/50 cursor-pointer transition-colors">
                <Checkbox 
                  checked={agreements.authorizedOnly}
                  onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, authorizedOnly: checked === true }))}
                  className="mt-0.5 border-red-500/50 data-[state=checked]:bg-red-600"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-red-400">
                    <Lock className="w-4 h-4" />
                    AUTHORIZED TESTING ONLY
                  </div>
                  <p className="text-xs text-slate-400">
                    I will ONLY test systems I own or have explicit written authorization to test. 
                    Unauthorized access to computer systems is a criminal offense.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded bg-slate-900/50 border border-slate-700 hover:border-red-500/50 cursor-pointer transition-colors">
                <Checkbox 
                  checked={agreements.legalCompliance}
                  onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, legalCompliance: checked === true }))}
                  className="mt-0.5 border-red-500/50 data-[state=checked]:bg-red-600"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-red-400">
                    <Scale className="w-4 h-4" />
                    LEGAL COMPLIANCE
                  </div>
                  <p className="text-xs text-slate-400">
                    I will comply with all applicable laws including CFAA (USA), StGB §202a+ (Germany), 
                    Computer Misuse Act (UK), and local cybersecurity laws.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded bg-slate-900/50 border border-slate-700 hover:border-red-500/50 cursor-pointer transition-colors">
                <Checkbox 
                  checked={agreements.noHarm}
                  onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, noHarm: checked === true }))}
                  className="mt-0.5 border-red-500/50 data-[state=checked]:bg-red-600"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-red-400">
                    <XCircle className="w-4 h-4" />
                    NO HARMFUL ACTIVITIES
                  </div>
                  <p className="text-xs text-slate-400">
                    I will not use this tool for: data theft, service disruption (DoS), 
                    ransomware distribution, or any activity that causes financial/reputational harm.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded bg-slate-900/50 border border-slate-700 hover:border-red-500/50 cursor-pointer transition-colors">
                <Checkbox 
                  checked={agreements.disclosure}
                  onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, disclosure: checked === true }))}
                  className="mt-0.5 border-red-500/50 data-[state=checked]:bg-red-600"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-red-400">
                    <FileText className="w-4 h-4" />
                    RESPONSIBLE DISCLOSURE
                  </div>
                  <p className="text-xs text-slate-400">
                    If I discover vulnerabilities, I will report them responsibly to the system owner 
                    and allow reasonable time for remediation before any public disclosure.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded bg-slate-900/50 border border-slate-700 hover:border-red-500/50 cursor-pointer transition-colors">
                <Checkbox 
                  checked={agreements.educationOnly}
                  onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, educationOnly: checked === true }))}
                  className="mt-0.5 border-red-500/50 data-[state=checked]:bg-red-600"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-red-400">
                    <CheckCircle className="w-4 h-4" />
                    EDUCATIONAL USE
                  </div>
                  <p className="text-xs text-slate-400">
                    I am using this tool for educational purposes, CTF competitions, 
                    bug bounty programs, or authorized penetration testing only.
                  </p>
                </div>
              </label>
            </div>

            <div className="bg-red-950/30 border border-red-500/30 rounded p-4 text-xs font-mono text-red-200">
              <p className="font-bold mb-2">LEGAL NOTICE:</p>
              <p>
                This tool operates entirely in your browser. No attacks are executed from our servers. 
                You are solely responsible for your actions. Session data is destroyed on tab close - 
                no logs are kept, but your ISP/network admin may still see traffic.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-red-500/30 flex gap-4">
          <Button
            onClick={onDecline}
            variant="outline"
            className="flex-1 border-red-500/50 text-red-400 hover:bg-red-950/50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Decline & Exit
          </Button>
          <Button
            onClick={onAccept}
            disabled={!allChecked}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            I Agree - Initialize Agent
          </Button>
        </div>
      </Card>
    </div>
  );
};
