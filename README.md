# GAS-attendance-management-app

初めてGoogle Apps Scriptを使って、およそ3日間で勤怠管理アプリを作成しました。
改善点があればご指摘いただけますと幸いです。
（現在ブラッシュアップ中です。詳しくは[今後の展望](#今後の展望)をご覧ください。）

## 実装した機能
- ログイン(どの企業か、管理者か従業員かを判別するため)
- 打刻
- 打刻履歴の閲覧(管理者)
- キャラクター(つばめさん)がひとことおしゃべりしてくれる
  - 時間帯や勤務の状態に合わせたあいさつ・おうえんをしてくれる

## データベースサンプル
https://docs.google.com/spreadsheets/d/1c6Ka8cryuBHM335R_kPBuWDs19WENTge1YfVKEnCV8M/edit?usp=sharing <br>
(上記はデータベースのサンプルであり、GASコードは付属しておりません。)

## 追加したい機能

- パスワードのハッシュ化
- 見た目やUIを整える
- ユーザー追加機能
- キャラクターとの簡単なおしゃべり機能
  - もっと状態にに合わせた、バラエティ豊かなあいさつ・おうえんをしてくれる
  - キャラクターが操作方法を案内してくれる
  - 正確な打刻を続けることでキャラクターに変化が現れる（成長したり、親密度が上がったり）

## 今後の展望
~~機能が一通り完成したら、データベースをスプレッドシートからMySQLやSQLiteのようなデータベース管理システムに移行したい。それに伴い、使用する技術(言語等)も見直す予定。~~<br>
HTML/CSSとPHPとMySQLを用いたwebアプリとしてブラッシュアップ中。事前の設計の甘さによって読みにくいコードになってしまった反省も活かして、まずは設計を見直してから本GASアプリで実装しきれなかった機能を追加予定。<br>
リポジトリ：https://github.com/fukuda-n-00/web-attendance-management-app.git

## おまけ
このアプリ作成によってGASでのアプリの作り方の理解が進んだため、新たにアプリケーションを作ることもできました。<br>
リポジトリ：https://github.com/fukuda-n-00/GAS-shinyPokedex-share-app.git
