import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import lightClasses from './Management.module.css';
import darkClasses from './ManagementDark.module.css';
import detailIcon from '../../assets/List/Detail_icon.png'
import normalProfile from '../../assets/List/Normal_profile_image.png'
import { fetchMembers, memberRegistration, fetchFilteredMember } from '../../store/management';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function Management() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode)
  const classes = isDarkMode ? darkClasses : lightClasses;

  const [selectedOption, setSelectedOption] = useState('direct');
  const [visibleCount, setVisibleCount] = useState(20);
  const fileInputRef = useRef(null)
  const [filters, setFilters] = useState({
    memberName: '',
    department: '',
    position: '',
    nfc: '',
    issueCount: '',
  });

  const [submitMemberData, setSubmitMemberData] = useState({
    name: '',
    departmentId: '',
    positionId: '',
    phoneNumber: '',
    nfc: '',
    profileImage: null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleDetailClick = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const logsData = useSelector((state) => state.management.data);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMembers())
  }, [dispatch]);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };

  const handleFilterChange = (event) => {
    const { id, value, type } = event.target;
    const processedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [id]: processedValue,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const filteredFilters = Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [key, value === '' ? null : value])
    );
    setVisibleCount(20);
    dispatch(fetchFilteredMember(filteredFilters))
    setFilters({
      memberName: '',
      id: '',
      department: '',
      position: '',
      nfc: '',
      issueCount: '',
    })
  };

  const handleSubmitChange = (event) => {
    const { name, value, type, files } = event.target;
    if (type === 'file') {
      const file = files[0];
      setSubmitMemberData((prevState) => ({
        ...prevState,
        [name]: file,
      }));
    } else {
      const processedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
      setSubmitMemberData((prevState) => ({
        ...prevState,
        [name]: processedValue,
      }));
    }
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   if (submitMemberData.profileImage && !['image/jpg', 'image/jpeg', 'image/png'].includes(submitMemberData.profileImage.type)) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: '<strong>유효하지 않은 형식입니다!</strong>',
  //       html: '<b>JPG, JPEG, PNG</b> 파일을 첨부해주세요!',
  //     });
  //     return
  //   }

  //   const formData = new FormData();
  //   formData.append('name', submitMemberData.name);
  //   formData.append('departmentId', submitMemberData.departmentId);
  //   formData.append('positionId', submitMemberData.positionId);
  //   formData.append('phoneNumber', submitMemberData.phoneNumber);
  //   formData.append('nfc', submitMemberData.nfc);

  //   if (submitMemberData.profileImage) {
  //       formData.append('profileImage', submitMemberData.profileImage);
  //   } else {
  //       const defaultProfileBlob = await urlToBlob(normalProfile);
  //       formData.append('profileImage', defaultProfileBlob, 'normal_profile_image.png');
  //   }
  //   for (let [key, value] of formData.entries()) {
  //     console.log(`${key}: ${value}`);
  //   }
  //   dispatch(memberRegistration(formData));

  //   setSubmitMemberData({
  //       name: '',
  //       departmentId: '',
  //       positionId: '',
  //       phoneNumber: '',
  //       nfc: '',
  //       profileImage: null,
  //   });

  //   if (fileInputRef.current) {
  //       fileInputRef.current.value = '';
  //   }
  // }
  const handleSubmit = async (event) => {
    event.preventDefault();

    // const defaultProfile = await fetch(normalProfile)
    // .then(response => response.blob())
    // .then(blob => new Promise((resolve, reject) => {
    //   const reader = new FileReader();
    //   reader.onloadend = () => resolve(reader.result);
    //   reader.onerror = reject;
    //   reader.readAsDataURL(blob);
    // }));

    if (submitMemberData.profileImage && !['image/jpg', 'image/jpeg', 'image/png'].includes(submitMemberData.profileImage.type)) {
      Swal.fire({
        icon: 'error',
        title: '<strong>유효하지 않은 형식입니다!</strong>',
        html: '<b>JPG, JPEG, PNG</b> 파일을 첨부해주세요!',
      });
      return
    }

    const formData = new FormData()

    if (submitMemberData.profileImage) {
      formData.append('profileImage', submitMemberData.profileImage);
    } else {
      const response = await fetch(normalProfile);
      const blob = await response.blob();
      const file = new File([blob], 'normal_profile_image.png', { type: 'image/png' });
      formData.append('profileImage', file);
    }

    const memberRegistDto = {
      phoneNumber: submitMemberData.phoneNumber,
      name: submitMemberData.name,
      nfc: submitMemberData.nfc,
      departmentId: submitMemberData.departmentId,
      positionId: submitMemberData.positionId,
      memberLoginId: 'aa',
      memberLoginPw: '11',
    };

    formData.append('memberRegistDto', new Blob([JSON.stringify(memberRegistDto)], { type: 'application/json' }));  

    try {
      await dispatch(memberRegistration(formData)).unwrap();

      setSubmitMemberData({
        name: '',
        departmentId: '',
        positionId: '',
        phoneNumber: '',
        nfc: '',
        profileImage: null,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  const displayedLogs = logsData.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(20);
  }, [logsData]);

  const totalLogsCount = logsData.length

  return (
    <div className={classes.mainContainer}>
      <div className={`${classes.filteringContainer} ${classes.relativeBoxContainer}`}>
        <div className={classes.filteringBox}>
            FILTERING
        </div>
        <div className={classes.inputContainer}> 
          <form onSubmit={handleSearch} className={classes.relativeBoxContainer}>
            <table className={classes.filterTable}>
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="memberName" className={classes.labelText}>이름</label>
                    <input className={classes.inputText} type="text" id="memberName" placeholder="이 름" value={filters.memberName} onChange={handleFilterChange} />
                  </td>
                  <td>
                    <label htmlFor="department" className={classes.labelText}>부서</label>
                    <input className={classes.inputText} type="text" id="department" placeholder="부 서" value={filters.department} onChange={handleFilterChange} />
                  </td>
                  <td>
                    <label htmlFor="position" className={classes.labelText}>직책</label>
                    <input className={classes.inputText} type="text" id="position" placeholder="직 책" value={filters.position} onChange={handleFilterChange} />
                  </td>
                  <td>
                    <label htmlFor="nfc" className={classes.labelText}>NFC</label>
                    <input className={classes.inputText} type="text" id="nfc" placeholder="N F C" value={filters.nfc} onChange={handleFilterChange} />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="issueCount" className={classes.labelText}>누적 이슈</label>
                    <input className={classes.inputText} type="number" id="issueCount" placeholder="누 적 이 슈" value={filters.issueCount} onChange={handleFilterChange} />
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className={classes.submitButtonCell}>
                    <button type="submit" className={classes.formButton}>검 색</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      </div>
      <div className={`${classes.registrationContainer} ${classes.relativeBoxContainer}`}>
        <div className={classes.filteringBox}>
          NEW
        </div>
        <div className={classes.inputContainer}>
          <div className={classes.optionLabel}>등록 옵션</div>
          <div className={classes.optionContainer}>
            <label className={classes.radioLabel}>
              <input
                type="radio"
                value="direct"
                checked={selectedOption === 'direct'}
                onChange={handleOptionChange}
                className={classes.radioInput}
              />
              직접 등록하기
            </label>
            <label className={classes.radioLabel}>
              <input
                type="radio"
                value="batch"
                checked={selectedOption === 'batch'}
                onChange={handleOptionChange}
                className={classes.radioInput}
              />
              일괄 등록하기
            </label>
          </div>
          <form onSubmit={handleSubmit} className={classes.relativeBoxContainer}>
            {selectedOption === 'direct' ?  (
              <table className={classes.filterTable}>
                <tbody>
                  <tr>
                    <td>
                      <label htmlFor="new memberName" className={classes.labelText}>이름</label>
                      <input className={classes.inputText} name="name" type="text" id="new memberName" value={submitMemberData.name} placeholder="이 름" onChange={handleSubmitChange} />
                    </td>
                    <td>
                      <label htmlFor="new department" className={classes.labelText}>부서</label>
                      <input className={classes.inputText} name="departmentId" type="number" id="new department" value={submitMemberData.departmentId} placeholder="부 서" onChange={handleSubmitChange} />
                    </td>
                    <td>
                      <label htmlFor="new position" className={classes.labelText}>직책</label>
                      <input className={classes.inputText} name="positionId" type="number" id="new position" value={submitMemberData.positionId} placeholder="직 책" onChange={handleSubmitChange} />
                    </td>
                    <td>
                      <label htmlFor="new phoneNumber" className={classes.labelText}>연락처</label>
                      <input className={classes.inputText} name="phoneNumber" type="number" id="new phoneNumber" value={submitMemberData.phoneNumber} placeholder="연 락 처" onChange={handleSubmitChange} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="new nfc" className={classes.labelText}>NFC</label>
                      <input className={classes.inputText} name="nfc" type="text" id="new nfc" value={submitMemberData.nfc} placeholder="N F C" onChange={handleSubmitChange} />
                    </td>
                    <td colSpan="4">
                      <label htmlFor="new profile" className={classes.labelText}>프로필 사진 파일을 선택해 주세요!</label>
                      <input type="file" id="new profile" name="profileImage" placeholder="프로필 사진" accept='.jpg, .jpeg, .png' onChange={handleSubmitChange} ref={fileInputRef} />
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div>
                <label htmlFor="new file" className={classes.labelText}>일괄 등록을 위해 파일을 선택해 주세요!</label>
                <input type="file" id="new file" placeholder='일괄 등록 파일' />
              </div>
            )}
            <button type="submit" className={classes.formButton}>등 록</button>
          </form>
        </div>  
      </div>
      <div className={classes.listContainer}>
        <div className={classes.listTitle}>
          등록 인원 목록
        </div>
        <div className={classes.logCount}>
          현재 조회 인원 : {totalLogsCount}명
        </div>
        <div className={classes.tableContainer}>
          <table className={classes.logTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>부서</th>
                <th>직책</th>
                <th>연락처</th>
                <th>NFC UID</th>
                <th>누적 이슈</th>
                <th>프로필 사진</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.id}</td>
                  <td>{log.memberName}</td>
                  <td>{log.departmentName}</td>
                  <td>{log.positionName}</td>
                  <td>{log.phoneNumber}</td>
                  <td>{log.nfc}</td>
                  <td>{log.issueCount}</td>
                  <td>
                    <img src={detailIcon}
                    alt="detail_icon"
                    className={classes.listIcon}
                    onClick={() => handleDetailClick(log)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={classes.moreButtonContainer}>
        {visibleCount < logsData.length && (
          <button onClick={handleLoadMore} className={classes.moreButton}>▼  더보기</button>
        )}
        </div>
      </div>
      {isModalOpen && <Modal log={selectedLog} onClose={handleCloseModal} />}
    </div>
  );
}

const Modal = ({ log, onClose }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode)
  const classes = isDarkMode ? darkClasses : lightClasses;
  if (!log) return null;

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={classes.modal} onClick={handleBackgroundClick}>
      <div className={classes.modalContent}>
        <span className={classes.close} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </span>
        <div className={classes.detailBox}>
          <div>{log.memberName}</div>
          <div className={classes.departmentBox}>부서: {log.departmentName}</div>
          <div>직책: {log.positionName}</div>
        </div>
        <div>자세히: {log.memberProfile}</div>
      </div>
    </div>
  );
};


export default Management;
