import EmployeeStats from './EmployeeStats';
import UploadExcel from './UploadExcel';
import VardiyaTipleri from './VardiyaTipleri';

export default function Sidebar() {
  return (
    <div className="space-y-4">
      <UploadExcel />
      <EmployeeStats />
      <VardiyaTipleri />
    </div>
  );
}
