package com.back.global.security;

import com.back.domain.member.entity.Member;
import com.back.domain.member.enums.UserRole;
import com.back.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            OAuth2User oAuth2User = super.loadUser(userRequest);
            log.info("OAuth2 사용자 정보 로드 성공");

            // 카카오에서 받아온 사용자 정보
            Map<String, Object> attributes = oAuth2User.getAttributes();
            log.info("카카오 사용자 속성: {}", attributes);

            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            if (kakaoAccount == null) {
                log.error("카카오 계정 정보가 없습니다.");
                throw new OAuth2AuthenticationException("카카오 계정 정보를 가져올 수 없습니다.");
            }

            String email = (String) kakaoAccount.get("email");
            if (email == null) {
                log.warn("이메일 정보가 없습니다. 카카오 ID를 사용합니다.");
                // 이메일이 없으면 카카오 ID를 사용
                String kakaoId = String.valueOf(attributes.get("id"));
                email = "kakao_" + kakaoId + "@kakao.com";
            }

            log.info("카카오 이메일: {}", email);

            // DB에 해당 이메일의 사용자가 있는지 확인
            Optional<Member> optionalMember = memberRepository.findByEmail(email);

            Member member;
            if (optionalMember.isPresent()) {
                // 이미 가입된 회원이면 그대로 반환
                member = optionalMember.get();
                log.info("기존 회원 로그인: {}", email);
            } else {
                // 가입되지 않은 회원이면, 새로 회원 정보를 만들어서 DB에 저장 (자동 회원가입)
                Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
                String nickname = (String) profile.get("nickname");

                member = Member.builder()
                        .email(email)
                        .name(nickname)
                        .password("OAUTH2_USER_PASSWORD")
                        .phone("010-0000-0000") // 필수값이어서 채움
                        .role(UserRole.USER)
                        .build();
                memberRepository.save(member);
                log.info("새 회원 가입: {}", email);
            }
            return new CustomOAuth2User(member, attributes);
        } catch (Exception e) {
            log.error("OAuth2 사용자 로드 중 오류 발생: {}", e.getMessage(), e);
            throw new OAuth2AuthenticationException("사용자 정보를 처리하는 중 오류가 발생했습니다.");
        }
    }
}