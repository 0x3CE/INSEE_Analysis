export default function HealthPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Santé</h1>
      <p className="text-gray-500">
        Module en cours de construction — densité médicale, lits hospitaliers,
        taux de vaccination par département.
      </p>
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-8 text-center text-sm text-gray-400">
        Connecter data.gouv.fr pour les jeux de données SNDS / DREES.
      </div>
    </div>
  );
}
