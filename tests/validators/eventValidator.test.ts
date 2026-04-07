import { validateEventRequest } from '../../src/validators/eventValidator';

describe('validateEventRequest', () => {
  const validBody = {
    event_type: 'appointment_confirmed',
    clinic_id: 'clinic-001',
    patient_id: 'patient-001',
    channels: ['email', 'sms'],
  };

  it('정상 요청을 통과시킨다', () => {
    const result = validateEventRequest(validBody);
    expect(result.valid).toBe(true);
  });

  it('body가 null이면 실패한다', () => {
    const result = validateEventRequest(null);
    expect(result).toEqual({ valid: false, error: 'Request body is required' });
  });

  it('body가 빈 객체이면 실패한다', () => {
    const result = validateEventRequest({});
    expect(result).toEqual({ valid: false, error: 'event_type must be one of: appointment_confirmed, insurance_approved, claim_completed' });
  });

  it('잘못된 event_type이면 실패한다', () => {
    const result = validateEventRequest({ ...validBody, event_type: 'invalid' });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('event_type must be one of');
    }
  });

  it('clinic_id가 없으면 실패한다', () => {
    const { clinic_id, ...body } = validBody;
    const result = validateEventRequest(body);
    expect(result).toEqual({ valid: false, error: 'clinic_id is required' });
  });

  it('patient_id가 없으면 실패한다', () => {
    const { patient_id, ...body } = validBody;
    const result = validateEventRequest(body);
    expect(result).toEqual({ valid: false, error: 'patient_id is required' });
  });

  it('channels가 빈 배열이면 실패한다', () => {
    const result = validateEventRequest({ ...validBody, channels: [] });
    expect(result).toEqual({ valid: false, error: 'channels must be a non-empty array' });
  });

  it('channels가 배열이 아니면 실패한다', () => {
    const result = validateEventRequest({ ...validBody, channels: 'email' });
    expect(result).toEqual({ valid: false, error: 'channels must be a non-empty array' });
  });

  it('잘못된 채널이 포함되면 실패한다', () => {
    const result = validateEventRequest({ ...validBody, channels: ['email', 'fax'] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('fax');
    }
  });

  it('모든 유효한 event_type을 통과시킨다', () => {
    const types = ['appointment_confirmed', 'insurance_approved', 'claim_completed'];
    for (const event_type of types) {
      const result = validateEventRequest({ ...validBody, event_type });
      expect(result.valid).toBe(true);
    }
  });

  it('모든 유효한 채널 조합을 통과시킨다', () => {
    const result = validateEventRequest({
      ...validBody,
      channels: ['email', 'sms', 'webhook'],
    });
    expect(result.valid).toBe(true);
  });

  // --- 경계값 테스트 ---

  it('clinic_id가 빈 문자열이면 실패한다', () => {
    const result = validateEventRequest({ ...validBody, clinic_id: '' });
    expect(result).toEqual({ valid: false, error: 'clinic_id is required' });
  });

  it('patient_id가 빈 문자열이면 실패한다', () => {
    const result = validateEventRequest({ ...validBody, patient_id: '' });
    expect(result).toEqual({ valid: false, error: 'patient_id is required' });
  });

  it('clinic_id가 숫자이면 실패한다', () => {
    const result = validateEventRequest({ ...validBody, clinic_id: 123 });
    expect(result).toEqual({ valid: false, error: 'clinic_id is required' });
  });

  it('patient_id가 숫자이면 실패한다', () => {
    const result = validateEventRequest({ ...validBody, patient_id: 456 });
    expect(result).toEqual({ valid: false, error: 'patient_id is required' });
  });

  it('event_type이 빈 문자열이면 실패한다', () => {
    const result = validateEventRequest({ ...validBody, event_type: '' });
    expect(result.valid).toBe(false);
    expect((result as { valid: false; error: string }).error).toContain('event_type must be one of');
  });

  it('channels에 중복값이 있어도 통과한다', () => {
    const result = validateEventRequest({ ...validBody, channels: ['email', 'email'] });
    expect(result.valid).toBe(true);
  });

  it('body가 undefined이면 실패한다', () => {
    const result = validateEventRequest(undefined);
    expect(result).toEqual({ valid: false, error: 'Request body is required' });
  });

  it('body가 배열이면 실패한다', () => {
    const result = validateEventRequest([1, 2, 3]);
    expect(result.valid).toBe(false);
  });
});
