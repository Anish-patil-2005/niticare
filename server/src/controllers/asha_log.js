import db from "../db/knex.js";

export const getAshaLogs = async (req, res) => {
  try {
    const { ashaId } = req.query;
    const { id: userId, role } = req.user;

    let query = db('anc_records as anc')
      .join('beneficiaries as b', 'anc.beneficiary_id', 'b.id')
      .join('forms as f', 'anc.form_id', 'f.id')
      .leftJoin('users as u', 'b.assigned_asha_id', 'u.id')
      .leftJoin('schedules as s', function() {
        this.on('s.beneficiary_id', '=', 'anc.beneficiary_id')
            .andOn('s.form_id', '=', 'anc.form_id');
      });

    // Role-based filtering
    if (role === 'asha') {
      query.where('b.assigned_asha_id', userId);
    } else if (role === 'admin' && ashaId) {
      query.where('b.assigned_asha_id', ashaId);
    }

    const logs = await query.select([
      'anc.created_at as anc_date',
      'b.name as beneficiary_name',
      'f.title as form_name',
      'f.phase as form_phase',
      'anc.month_number',
      's.scheduled_date',
      's.status as schedule_status',
      'u.full_name as asha_name'
    ]).orderBy('anc.created_at', 'desc');

    const formattedLogs = logs.map(log => {
      const today = new Date();
      today.setHours(0,0,0,0);

      const ancDate = new Date(log.anc_date);
      const scheduled = log.scheduled_date ? new Date(log.scheduled_date) : null;

      let status = 'Planned';
      let timing = scheduled ? 'Upcoming' : 'Not Scheduled';

      // If ANC record exists, mark Completed
      if (log.anc_date) {
        status = 'Completed';
        timing = scheduled
          ? ancDate <= scheduled ? 'Within Date' : 'Overdue'
          : 'Not Scheduled';
      } else if (scheduled) {
        // Planned but not done
        status = 'Planned';
        timing = scheduled < today ? 'Overdue' : 'Upcoming';
      }

      return {
        date: log.anc_date || log.scheduled_date || null,
        beneficiary: log.beneficiary_name,
        ashaName: log.asha_name || 'Unassigned',
        phase: log.form_phase?.toUpperCase() || 'N/A',
        visit: log.form_name,
        month: log.month_number || 'N/A',
        status,
        timing,
        isAlert: timing === 'Overdue' || status === 'Missed'
      };
    });

    res.status(200).json(formattedLogs);

  } catch (error) {
    console.error('Log Error:', error);
    res.status(500).json({ message: 'Error fetching activity logs' });
  }
};
