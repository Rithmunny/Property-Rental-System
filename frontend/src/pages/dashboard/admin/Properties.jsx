import { useProperties } from '../../../context/PropertiesContext'
import { LANDLORDS } from '../../../data/admin'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatusPill from '../../../components/dashboard/StatusPill'

export default function AdminProperties() {
  const { properties } = useProperties()

  return (
    <div>
      <PageHeader title="Properties" subtitle={`${properties.length} listings from ${LANDLORDS.length} landlords`} />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Property</th>
              <th className="px-5 py-3 font-medium">City</th>
              <th className="px-5 py-3 font-medium">Landlord</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {properties.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900">{p.title}</td>
                <td className="whitespace-nowrap px-5 py-3 text-gray-600">{p.city}</td>
                <td className="whitespace-nowrap px-5 py-3 text-gray-600">{p.landlord}</td>
                <td className="whitespace-nowrap px-5 py-3 text-gray-600">${p.price}/mo</td>
                <td className="whitespace-nowrap px-5 py-3">
                  <StatusPill
                    label={p.available ? 'Available' : 'Rented'}
                    tone={p.available ? 'positive' : 'neutral'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
