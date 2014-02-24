<?php
// 받는 사람이 여럿일 경우 , 로 늘려준다.
$to  = '4everwrz@gmail.com' . ', '; // note the comma

// 제목
$subject = '봇방지~!';

// 내용
$message = '
<html>
<head>
  <title>봇방지~!</title>
</head>
<body>
  <p>봇방지가 떳습니다. 고객님</p>
</body>
</html>
';

// HTML 내용을 메일로 보낼때는 Content-type을 설정해야한다
$headers  = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/html; charset=euc-kr' . "\r\n";

// 추가 header

// 받는사람 표시
$headers .= 'To: 히데 <4everwrz@gmail.com>' . "\r\n";

// 보내는사람
$headers .= 'From: 히데 <4everwrz@gmail.com>' . "\r\n";

// 메일 보내기
mail($to, $subject, $message, $headers);
?>
