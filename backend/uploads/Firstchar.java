public class Firstchar {
    public static void main(String args[]){
        String s="My name is Sharada Pujari";
        char ch[]=s.toCharArray();
        for(int i=0;i<ch.length;i++){
            if(ch[i]!=' '){
                if(i==0){
                    System.out.println(ch[i]);
                }
                else{
                    if(ch[i-1] == ' '){
                        System.out.println(ch[i]);
                    }
                }

            }
           
        }
    }
    
}
